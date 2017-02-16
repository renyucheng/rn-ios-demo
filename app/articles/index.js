/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
 
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

class Articles extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>文章页面</Text>
      </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})

module.exports = Articles