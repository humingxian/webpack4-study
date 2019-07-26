import React from 'react'
// 项目中jquery太大了，一般不用
import $ from 'jquery'

const Home = () => (
  <div>{() => {
    return $('<h1>123</h1>')
  }}</div>
)

export default Home
