import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import * as apiClient from '../api-client';
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();
  // const navigate = useNavigate();

  const { data: hotel } = useQuery(
    "fetchMyHotelById",
    ()=> apiClient.fetchMyHotelById(hotelId || ''),
    // tell useQuery to only call API if hotelId has a valid string.
    // 只有有效的hotelId才能call API.
    {
      enabled: !!hotelId,
    }
  );
  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
      // navigate("/my-hotels");
    },
    onError: () => {
      showToast({ message: "Error Saveing Hotel", type: "ERROR" });
    },
  })

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  }

  return (
    <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading}/>
  );
};

export default EditHotel;