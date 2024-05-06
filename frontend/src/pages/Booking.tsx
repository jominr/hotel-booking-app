import { useQuery } from "react-query";
import * as apiClient from "../api-client"
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../contexts/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailSummary from "../components/BookingDetailSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = () => {
  const { stripePromise } = useAppContext();
  // 获取到用户查询的信息：时间段，人数
  const search = useSearchContext();
  const { hotelId } = useParams();
  
  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  // 计算入住的天数
  useEffect(()=> {
    if(search.checkIn && search.checkOut) {
      const nights = 
        Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) / 
        (1000 * 60 * 60 * 24);

      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut])
  
  // 创建paymentIntentData，传参userId, hotelId, numberOfNights
  const { data: paymentIntentData } = useQuery(
    "createPaymentIntent",
    ()=> 
      apiClient.createPaymentIntent(
        hotelId as string, 
        numberOfNights.toString()
      ),
    {
      enabled: !!hotelId && numberOfNights > 0,
    }
  );

  // 获取到酒店的信息：酒店地址、价格
  const { data: hotel } = useQuery(
    "fetchHotelById", 
    // 要传参，所以这么写？
    () => apiClient.fetchHotelById(hotelId as string),
    {
      enabled: !!hotelId,
    }
  );
  
  // 获取到用户的信息：用户名，email
  const { data: currentUser } = useQuery(
    "fetchCurrentUser", 
    apiClient.fetchCurrentUser
  );

  if (!hotel) {
    return <></>
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr]">
      <BookingDetailSummary
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adultCount={search.adultCount}
        childCount={search.adultCount}
        numberOfNights={numberOfNights}
        hotel={hotel}
      />
      {currentUser && paymentIntentData && (
        // 展示tripe要展示的部分，
        // Element来自stripe frontend SDK, 给我们一些stripe UI elements that give us card details and lets us create a payment from the UI
        <Elements
          stripe={stripePromise}
          options={{
            locale: "en", // 语言环境
            clientSecret: paymentIntentData.clientSecret,
          }}
        >
          <BookingForm currentUser={currentUser} paymentIntent={paymentIntentData}/>
        </Elements>
      )} 
    </div>
  );
};

export default Booking;