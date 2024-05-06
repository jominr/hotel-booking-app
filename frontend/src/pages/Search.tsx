import { useQuery } from "react-query";
import { useSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useState } from "react";
import SearchResultCard from "../components/SearchResultCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import HotelTypesFilter from "../components/HotelTypesFilter";
import FacilitiesFilter from "../components/FacilitiesFilter";
import PriceFilter from "../components/PriceFilter";


const Search = () => {
  // 这里是输入项
  const search = useSearchContext();
  // 下面是当前页面的筛选项，所以是在当前页面定义的。
  const [page, setPage] = useState<number>(1);
  const [selectedStars, setSelectedStars] = useState<string[]>([])
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>("");
  
  // 上面两部分都转换成string类型的数据，就变成了接口要的数据
  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(), // '2024-05-05T13:08:55.659Z'
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  // ["searchHotels", searchParams], 传参
  const { data: hotelData } = useQuery(["searchHotels", searchParams], () =>
    // return this
    apiClient.searchHotels(searchParams)
  );

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    )
  }

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const facility = event.target.value;
    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((preFacility) => preFacility !== facility)
    )
  }

  const handleHotelTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((type) => type !== hotelType)
    )
  }

  return (
    // 小屏幕grid-cols-1, 大屏幕2栏，左栏250px, 又栏剩余的空间，
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      {/* h-fit: fit the height of the container, sticky滚动粘顶. 小屏幕sticky的话字都重叠在一起了。*/}
      <div className="rounded-lg border border-slate-300 p-5 h-fit top-10 lg:sticky">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">Filter by:</h3>
        </div>
        <StarRatingFilter selectedStars={selectedStars} onChange={handleStarsChange}/>
        <HotelTypesFilter selectedHotelTypes={selectedHotelTypes} onChange={handleHotelTypeChange}/>
        <FacilitiesFilter selectedFacilities={selectedFacilities} onChange={handleFacilityChange}/>
        <PriceFilter selectedPrice={selectedPrice} onChange={(value?:number) => setSelectedPrice(value)}/>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-x1 font-bold">
            {hotelData?.pagination.total} Hotels found
            {search.destination ? ` in ${search.destination}` : ""}
          </span>
          <select
            value={sortOption}
            onChange={event=> setSortOption(event.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="pricePerNightAsc">Price Per Night (low to high)</option>
            <option value="pricePerNightDesc">Price Per Night (high to low)</option>
          </select>
        </div>
        {hotelData?.data.map((hotel)=>(
          <SearchResultCard key={hotel._id} hotel={hotel}/>
        ))}
        <div>
          <Pagination
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(page)=> setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;