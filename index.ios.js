/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  TabBarIOS,
  Text,
  Navigator,
  View
} from 'react-native'

import Videos from './app/videos/index'
import Articles from './app/articles/index'
import Account from './app/account/index'

import Icon from 'react-native-vector-icons/Ionicons'

class MachineLearning extends Component {

  state = {
    selectedTab: 'Videos',
  }

  render() {
    return (
      <TabBarIOS tintColor="#ee735c">
          <Icon.TabBarItem
            iconName='ios-videocam-outline'
            selectedIconName='ios-videocam'
            selected={this.state.selectedTab === 'Videos'}
            onPress={() => {
              this.setState({
                selectedTab: 'Videos',
              })
            }}>
            <Navigator 
              initialRoute={{
                name: 'videos',
                component: Videos
              }}
              configureScene={(route) => {  
                return Navigator.SceneConfigs.FloatFromRight
              }}
              renderScene={(route, navigator) => {
                var Component = route.component

                return <Component {...route.params} navigator={navigator}
                  />
              }}
              />
          </Icon.TabBarItem>
          <Icon.TabBarItem
            iconName='ios-book-outline'
            selectedIconName='ios-book'
            selected={this.state.selectedTab === 'Articles'}
            onPress={() => {
              this.setState({
                selectedTab: 'Articles',
              })
            }}>
            <Articles />
          </Icon.TabBarItem>
          <Icon.TabBarItem
            iconName='ios-person-outline'
            selectedIconName='ios-person'
            selected={this.state.selectedTab === 'Account'}
            onPress={() => {
              this.setState({
                selectedTab: 'Account',
              })
            }}>
            <Account />
          </Icon.TabBarItem>
        </TabBarIOS>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})

AppRegistry.registerComponent('MachineLearning', () => MachineLearning)
