import React from 'react'
import {View,StyleSheet} from "react-native"
import Heading from "@/components/heading"

const editProduct = () => {
  return (
    <View style={styles.container}>
      <Heading title="Edit Product" leftIcon='close'  onLeftPress={() => console.log("Closed")} />
    </View>
  )
}

export default editProduct
const styles= StyleSheet.create({
container:{
    flex:1,
    backgroundColor:"#fff",
    padding:16,
    paddingTop:50,
}
})
