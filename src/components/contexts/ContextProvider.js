import React, {createContext, useContext, useState} from "react";

//Api react.createContext creates a context object . When react renders a component that subscribes to this context object, it will read the current context value from the closest matching Provider above it in the tree
const StateContext = createContext();

const initialState = {
    userProfile: false
}

export const ContextProvider = ({children}) =>{
    const [activeMenu, setActiveMenu] = useState(true)

    return (
        <StateContext.Provider
            value={
                {activeMenu, setActiveMenu,

                }

            }
        >
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext)