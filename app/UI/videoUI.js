'use strict'
import React, { Component } from 'react'
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Text,
  View,
  ActivityIndicatorIOS,
} from 'react-native'

var Icon = require('react-native-vector-icons/Ionicons')
var VideoPlayer = require('react-native-video').default

var width = Dimensions.get('window').width
var timer = null

var Circle = React.createClass({

  _panResponder: {},
  _previousLeft: 0,
  _previousTop: 0,
  _circleStyles: {},
  _barStyles: {},
  circle: (null : ?{ setNativeProps(props: Object): void }),
  bar: (null : ?{ setNativeProps(props: Object): void }),

  componentWillMount: () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    })

    this._previousLeft = this.props.currentTime  === 0 ? -2 : this.props.currentTime / this.props.videoTotal * 200
    this._previousTop = -6
    this._circleStyles = {
      style: {
        left: this._previousLeft - 3,
        top: this._previousTop
      }
    }
    this._barStyles = {
      style: {
        marginLeft: -2,
        left: 3,
        top: 0,
      }
    }
  },

  componentDidMount: () => {
    this._updatePosition()
  },

  render() {
    var percent = this.props.currentTime / this.props.videoTotal 
    if(this.props.currentTime === 0) {
      this._previousLeft = -2
    }
    
    return (
      <View>
        <View
          ref={(bar) => {
            this.bar = bar
          }}
          style={[styles.bar,{width: 200 * percent}]}
        />
        <View
          ref={(circle) => {
            this.circle = circle
          }}
          style={[styles.circle, {left: 200 * percent}]}
          {...this._panResponder.panHandlers}
        />
      </View>
    )
  },

  _updatePosition: () => {
    this.circle && this.circle.setNativeProps(this._circleStyles)
    this.bar && this.bar.setNativeProps(this._barStyles)
  },

  _handleStartShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
    // Should we become active when the user presses down on the circle?
    return true
  },

  _handleMoveShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
    // Should we become active when the user moves a touch over the circle?
    return true
  },

  _handlePanResponderMove: function(e: Object, gestureState: Object) {
    var x = this._previousLeft + gestureState.dx
    if(x > 194) {
      x = 194
    } else if(x < 0) {
      x = 0
    }

    this.props.changeCurrentTime(x / 200 * this.props.videoTotal)
    this._circleStyles.style.left = x
    this._barStyles.style.width = x
    this._updatePosition()
    this.props.showUI('changing')
  },

  _handlePanResponderEnd: function(e: Object, gestureState: Object) {
    this.props.showUI('endchanging')

    var x = this._previousLeft + gestureState.dx
    if(x > 194) {
      x = 194
    } else if(x < 0) {
      x = 0
    }

    this._previousLeft = x
    if(x === 194 ) {
      this.props.changeProgress(this.props.videoTotal - 1)
    }else {
      this.props.changeProgress(x / 200 * this.props.videoTotal)
    }
  },
})

var Video = React.createClass({
  getInitialState() {
    var data = this.props.data

    return {
     data: data,
      playing: false,
      videoLoaded: false,
      paused: false,
      shouldUIShow: false,
      isProgressChanging: false,

      videoProgress: 0,
      videoTotal:0,
      currentTime: 0,
      rate: 1,
      muted: false,
      resizeMode: 'contain',
      repeat: false,
    }
  },

  componentWillUnmount: () => {
    console.log('1')
    // clearTimeout(timer)
  },

  _onLoadStart: () => {
    console.log('load start')
  },

  _onLoad: () => {
    console.log('loads')
  },

  _onProgress(data) {
    console.log('videoLoaded: true')
    if (!this.state.videoLoaded) {
      this.setState({
        videoLoaded: true,
        playing: true,
      })
    }
    if(!this.state.isProgressChanging) {
      if(this.state.playing) {
        var duration = data.seekableDuration
        var currentTime = data.currentTime
        var percent = Number(currentTime / duration).toFixed(2)
        var newState = {
          videoTotal: duration,
          currentTime: Number(currentTime.toFixed(2)),
          videoProgress:percent
        }

        this.setState(newState)
      }
    }
  },

  _onEnd: () => {
    this.setState({
      videoProgress: 1,
      playing: false,
      shouldUIShow: true,
    })
    console.log('end')
  },

  _onError(e) {
    console.log(e)
    console.log('error')
  },

  _replay: () => {
    this.setState({
      videoProgress: 0,
      currentTime: 0,
      playing: true
    })
    this.refs.videoPlayer.seek(0)
  },

  _pause(data) {
    if(this.state.paused !== true) {
      clearTimeout(timer)
      this.setState({
        paused: true,
        shouldUIShow: true,
      })
    }
  },

  _reStart: () => {
    if(!this.state.playing) {
      this._replay()
    }else {
      if(this.state.paused) {
        this.setState({
          paused: false
        })
      }
    }
  },

  _changeCurrentTime(time) {
    this.setState({
      currentTime: time,
    })
  },

  _changeProgress(time) {
    this.refs.videoPlayer.seek(time)
  },

  _parseTime(time) {
    if(time > 600) {
      var minutes = Math.floor(time / 60) + ':'
    }else {
      var minutes = '0' + Math.floor(time / 60) + ':'
    }
    if(time % 60 < 10) {
      var seconds = '0' + Math.floor(time % 60)
    }else {
      var seconds = Math.floor(time % 60)
    }
    time = minutes + seconds
    return time
  },

  _shouwUI(param) {
    clearTimeout(timer)
    if(param === 'changing') {
      this.setState({
        playing: true,
        shouldUIShow: true,
        isProgressChanging: true,
      })
    }else if(param === 'endchanging') {
      var that = this
      this.setState({
        isProgressChanging: false,
      })

      console.log('1')

      timer = setTimeout(function(){
        that.setState({
          shouldUIShow: false,
        })
      },6000)
    }else {
      if(!this.state.shouldUIShow) {
        console.log(this.state.videoProgress)
        var that = this
        this.setState({
          shouldUIShow: true,
        })

        console.log('2')
        timer = setTimeout(function(){
          that.setState({
            shouldUIShow: false,
          })
        },6000)
      }else {
        this.setState({
          shouldUIShow: false,
        })
      }
    }
  },

  render() {
   var data = this.state.data
   var leftTime = (this.state.videoTotal - this.state.currentTime)

    return (
      <View>
        <TouchableOpacity activeOpacity={1} onPress={this._shouwUI}>
          <VideoPlayer
            ref='videoPlayer'
            source={{uri: data.video}}
            style={styles.video}
            volume={1}
            paused={this.state.paused}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}
            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onProgress={this._onProgress}
            onEnd={this._onEnd}
            onError={this._onError} />
            {
              !this.state.videoLoaded && <ActivityIndicatorIOS color='
                #ee735c' style={styles.loading} />
            }

        </TouchableOpacity>
        {
          this.state.shouldUIShow
          ? <View>
            <View style={styles.playerUIBox}></View>
            <View style={styles.playerUI}>
              {
                !this.state.paused && this.state.playing
                ? <Icon
                    onPress={this._pause}
                    name='ios-pause'
                    size={30}
                    style={styles.playPause} />
                : <Icon
                    onPress={this._reStart}
                    name='ios-play'
                    size={30}
                    style={styles.playPause} />
              }
              <View>
                <Text style={styles.playedTime}>{this._parseTime(this.state.currentTime)}</Text>
              </View>
              <View style={styles.playBar}>
                <Circle showUI={this._shouwUI} changeProgress={this._changeProgress} changeCurrentTime={this._changeCurrentTime} videoTotal={this.state.videoTotal} currentTime={this.state.currentTime}></Circle>
                <View style={styles.playProgress}></View>
              </View>
              <View>
                <Text style={styles.leftTime}>{this._parseTime(leftTime)}</Text>
              </View>
            </View>
          </View>
          : null
        }
      </View>
    )
  }
})

var styles = StyleSheet.create({
  video: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },

  loading: {
    position: 'absolute',
    left: 0,
    top: width * 0.56 / 2,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },

  progressControl: {
    opacity: 0.2,
    marginTop: -40,
    width: width,
    height: 40,
    backgroundColor: '#000'
  },

  progressBox: {
    opacity: 1,
    marginTop: -22,
    left: 60,
    width: width - 120,
    height: 4,
    backgroundColor: '#ccc'
  },

  playIcon: {
    position: 'absolute',
    top: 63,
    left: width / 2 - 30,
    bottom: 14,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66',
  },

  playerUIBox: {
    marginTop: -39,
    opacity: 0.6,
    height: 40,
    backgroundColor: '#000',
  },

  playerUI: {
    backgroundColor: 'transparent',
    marginTop: -35,
    flexDirection: 'row',
  },

  playPause: {
    color: '#fff',
    marginLeft: 20,
    marginRight:10,
  },

  playedTime: {
    position: 'absolute',
    left: 0,
    color: '#fff',
    marginLeft:10,
    marginTop: 8,
    marginRight:8,
  },

  playBar: {
    position: 'absolute',
    left: 98,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 14,
    backgroundColor: '#A9A9A9',
    width: 200,
    height: 4,
  },

  leftTime: {
    position: 'absolute',
    left: 270,
    color: '#fff',
    marginTop: 8,
    marginLeft: 8,
  },

  playStart: {
    marginTop: -35,
    position: 'absolute',
    left: 30,
    width: 40,
    height: 40,
    color: '#fff',
    backgroundColor: 'transparent',
  },

  circle: {
    width: 12,
    height: 12,
    borderRadius: 12 / 2,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    marginTop: 2,
  },

  bar: {
    height: 4,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
  },
})

module.exports = Video
