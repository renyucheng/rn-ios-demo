import React, { Component } from 'react'

const request = require('../common/request')
const config = require('../common/config')

import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  AlertIOS
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'
var Detail = require('./detail')

var width = Dimensions.get('window').width

var cachedResults = {
  nextPage: 1,
  items: [],
  total: 0,
  refreshing: true
}

class Item extends Component {
  constructor(props) {
    super(props)
    this.state = {
      up: false,
      row: this.props.row 
    }
  }

  _up = () => {
    var that = this
    var up = !this.state.up
    var row = this.state.row
    var url = config.api.base + config.api.up

    this.setState({up: up})  

    var body = {
      up: up? 'yes' : 'no',
      accessToken: 'qqqq'
    }

    request.post(url, body)
      .then(function(data) {
        if(data && data.success) {
          console.log('点赞成功')
        }
        else {
          that.setState({up: !up})
          AlertIOS.alert('点赞失败，稍后重试!')
        }
      })
      .catch(function(err) {
        console.log(err)
        that.setState({up: !up})
        AlertIOS.alert('点赞失败，稍后重试')
      })
  }

  render() {
    var row = this.state.row

    return (
      <TouchableOpacity activeOpacity={1} onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image
            source={{uri: row.thumb}}
            style={styles.thumb}>
            <Icon
              name='ios-play'
              size={28}
              style={styles.play} />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name={this.state.up ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                style={[styles.up, this.state.up ? null : styles.down]} 
                onPress={this._up}
                />
              <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name='ios-chatboxes-outline'
                size={28}
                style={styles.commentIcon} />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

class Videos extends Component {
  constructor(props) {
  super(props) 
  const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })

  this.state = {
      isRefreshing: false,
      isLoadingTail: false,
      dataSource: ds.cloneWithRows([]),
  }
}

  _renderRow = (row) => {
    return <Item key={row.customerId} onSelect={() => this._loadPage(row)} row={row} />
  }

  componentDidMount = () => {
    this._fetchData(1)
  }

  _loadPage = (row) => {
    console.log('load detail')
    this.props.navigator.push({
      name: 'detail',
      component: Detail,
      params: {
        data: row
      }
    })
  }

  _fetchData = (page) => {
    var that = this
    if(page !== 0) {
      this.setState({
      isLoadingTail: true
      })
    }
    
    request.get(config.api.base + config.api.creations, {
      accessToken:'bbbb',
      page: page
    })
      .then((data) => {
        if(data.success) {
          var items = cachedResults.items.slice()

          if(page !== 0) {
            items = items.concat(data.data)
            cachedResults.nextPage = page + 1
          }
          else {
            items = data.data.concat(items)
          }

          cachedResults.items = items
          cachedResults.total = data.total
          // 模拟网络延迟
          setTimeout(function(){
            if(page !== 0) {
              //如果用this 会指向[object DedicatedWorkerGlobalScope]this
            that.setState({
              isLoadingTail: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            })
            }
            else {
              // 如果用this 会指向[object DedicatedWorkerGlobalScope]this
            that.setState({
              isRefreshing: false,
              dataSource: that.state.dataSource.cloneWithRows(cachedResults.items)
            })
            }
          },1000)
        }      
      })
      .catch((error) => {
        if(page != 0) {
        this.setState({
          isLoadingTail: false
        })
        }
        else {
          this.setState({
          isRefreshing: false
        })
        }
        console.warn(error)
      })
  }

  _hasMore = () => {
    return cachedResults.items.length !== cachedResults.total
  }

  _fetchMoreData = () => {
    console.log('fetch more data')
    if (!this._hasMore() || this.state.isLoadingTail) {
      console.log(cachedResults.times)
      return <View style={styles.loadingMore} />
    }
    var page = cachedResults.nextPage
    this._fetchData(page)
  }

  _onRefresh = () => {
    this.setState({
        isRefreshing:true
      })
    if (!this._hasMore()) {
      this.setState({
        isRefreshing:false
      })
      return
    }
    
    this._fetchData(0)  
  }

  _renderFooter = () => {
    if (!this._hasMore() && cachedResults.total !== 0) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多了</Text>
        </View>
        )
    }

    // 没观察出效果
    if (!this.state.isLoadingTail) {
      return <View style={styles.loadingMore} />
    }

    return <ActivityIndicator style={styles.loadingMore} />
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>视频列表</Text>
        </View>
        <ListView 
          onSelect={this._loadPage}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
          refreshControl={
            <RefreshControl
              refreshing={cachedResults.refreshing === true? this.state.isRefreshing : cachedResults.refreshing}
              onRefresh={this._onRefresh}
              tintColor="#ff6600"
              title="Loading..."
            />
          }
          renderFooter={this._renderFooter}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
        />
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCDCDC',
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

  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },

  thumb: {
    width: width,
    height: width * 0.5,
    resizeMode: 'cover'
  },

  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },

  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF'
  },

  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66'
  },

  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333'
  },

  up: {
    fontSize: 22,
    color: '#ed7b66'
  },

  down: {
    fontSize: 22,
    color: '#333'
  },

  commentIcon: {
    fontSize: 22,
    color: '#333'
  },

  loadingMore: {
    marginVertical: 20,    
  },

  loadingText: {
    color: '#777',
    textAlign: 'center'
  }

})
module.exports = Videos