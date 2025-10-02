import React from 'react'
import { View,StyleSheet } from 'react-native'
import Heading from "@/components/heading"

const addProduct = () => {
  return (
    <View style={styles.container}>
      <Heading title="Add Product" leftIcon='close'  onLeftPress={() => console.log("Closed")} />
    </View>
  )
}

export default addProduct;
const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fff",
        padding:16,
        paddingTop:50
    }
})
