import React from "react";
import { createContext, useEffect, useState } from "react";
import { products } from "../assets/frontend_assets/assets";
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext()

const ShopContextProvider = (props)=>{

    const currency = '$'
    const delivery_fee = 10
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const navigate = useNavigate()
   
    const addToCart = async (itemId, size)=>{
        if (!size) {
            toast.error("Select Product Size")
            return
        }
        let cartData = structuredClone(cartItems)

        cartData[itemId] = cartData[itemId] ?? {}
        cartData[itemId][size] = (cartData[itemId][size] ?? 0)+1

        setCartItems(cartData)
        
    }

    const getCartCount = ()=>{
        let totalCount = 0
        for(let itemId in cartItems){
            for(let size in cartItems[itemId]){
                totalCount += cartItems[itemId][size]
            }
        }

        return totalCount
    }

  
    const updateQuantity = async (itemId, size, quantity) =>{
        let cartData = structuredClone(cartItems)

        cartData[itemId][size]=quantity

        setCartItems(cartData)
    }

    const getCartAmount = () => {
        let totalAmount=0
        for(const itemId in cartItems){
            let itemInfo = products.find((product)=>product._id === itemId)
            for(const size in cartItems[itemId]){
                try {
                    if (cartItems[itemId][size] > 0) {
                        totalAmount += itemInfo.price * cartItems[itemId][size]
                    }
                } catch (error) {
                    return
                }
            }
        }

        return totalAmount
    }


    // useEffect(()=>{
    //     console.log(cartItems);
        
    // },[cartItems])

    const value = {
        products, currency, delivery_fee, search,setSearch, showSearch,setShowSearch, cartItems, setCartItems,addToCart
        ,getCartCount , updateQuantity, getCartAmount, navigate
    }

    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider