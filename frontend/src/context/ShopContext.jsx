import React from "react";
import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/frontend_assets/assets";
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext()

const ShopContextProvider = (props)=>{

    const currency = '$'
    const delivery_fee = 10
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [products, setProducts] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ?? '')
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

        if (token) {
            try {
                await axios.post(backendUrl+'/api/cart/add', {itemId, size}, {headers:{token}})
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
        
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

        if (token) {
            try {
                await axios.post(backendUrl+'/api/cart/update', {itemId, size, quantity},{headers:{token}})
            } catch (error) {
                console.log(error);
                toast.error(error.message)
            }
        }
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

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl+'/api/product/list')
            
            
            if (response.data.success) {
                setProducts(response.data.products)  
            }else{
                toast.error(response.data.message)
            }
            
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
               setCartItems(response.data.cartData) 
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getProductsData()
    },[])

    // useEffect(()=>{
    //     if (!token && localStorage.getItem('token')) {
    //         setToken(localStorage.getItem('token'))
    //         getUserCart(localStorage.getItem('token'))
    //     }
    // },[token])

    useEffect(() => {
    if (token) {
        getUserCart(token)
    }
    }, [token])

    const value = {
        products,
        currency, delivery_fee, search,setSearch, showSearch,setShowSearch, cartItems, setCartItems,addToCart
        ,getCartCount , updateQuantity, getCartAmount, navigate, backendUrl, 
        token,setToken
    }

    return(
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider