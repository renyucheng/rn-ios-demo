/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
 
import React, { Component } from 'react'
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  View
} from 'react-native'

var width = Dimensions.get('window').width

var Icon = require('react-native-vector-icons/Ionicons')
var Video = require('../UI/videoUI')

class Detail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data 
    }
  }

  _backToList = () => {
    this.props.navigator.pop()
  }

  render() {
    var data = this.state.data
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text onPress={this._backToList} style={styles.headerTitle}>详情页面</Text>
        </View>
        <View style={styles.videoBox}>
          <Video data={this.state.data}/>
        </View>
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },

  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c'
  },

  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },

  videoBox: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },


})

module.exports = Detail