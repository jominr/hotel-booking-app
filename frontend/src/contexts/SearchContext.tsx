import React, { useContext, useState } from "react";

// 我们在很多页面都会用到，所以搞了个searchContext.

// 第一步：
type SearchContext = {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  hotelId: string;
  saveSearchValues: (
    destination: string, 
    checkIn: Date, 
    checkOut: Date, 
    adultCount: number, 
    childCount: number
  ) => void;
};

// 第二步：
const SearchContext = React.createContext<SearchContext | undefined>(undefined);

// 第四步：
type SearchContextProviderProps = {
  children: React.ReactNode;
};

export const SearchContextProvider = ({
  children,
}: SearchContextProviderProps)=> {

  // 第五步：
  const [destination, setDestination] = useState<string>(()=> 
    // 第六步：
    sessionStorage.getItem("destination") || ""
  );
  const [checkIn, setCheckIn] = useState<Date>(()=> 
    new Date(sessionStorage.getItem("checkIn") || new Date().toISOString())
  );
  const [checkOut, setCheckOut] = useState<Date>(()=>
    new Date(sessionStorage.getItem("checkOut") || new Date().toISOString())
  );
  const [adultCount, setAdultCount] = useState<number>(()=>
    parseInt(sessionStorage.getItem("adultCount") || "1")
  );
  const [childCount, setChildCount] = useState<number>(()=>
    parseInt(sessionStorage.getItem("childCount") || "0")
  );
  const [hotelId, setHotelId] = useState<string>(()=>
    sessionStorage.getItem("hotelId") || ""
  );

  // 第五步：
  const saveSearchValues = (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number, 
    childCount: number,
    hotelId?:string,
  ) => {
    setDestination(destination);
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);
    if (hotelId) {
      setHotelId(hotelId);
    }

    // 第六步：
    sessionStorage.setItem("destination", destination);
    sessionStorage.setItem("checkIn", checkIn.toISOString());
    sessionStorage.setItem("checkOut", checkOut.toISOString());
    sessionStorage.setItem("adultCount", adultCount.toString());
    sessionStorage.setItem("childCount", childCount.toString());
    if (hotelId) {
      sessionStorage.setItem("hotelId", hotelId);
    }
  };

  // 第三步：
  return (
    <SearchContext.Provider
      // 第六步：
      value={{
        destination, 
        checkIn, 
        checkOut, 
        adultCount, 
        childCount, 
        hotelId,
        saveSearchValues
    }}>
      {children}
    </SearchContext.Provider>
  );
};

// create a hook that lets components get easy access to these properties. 
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContext;
}
