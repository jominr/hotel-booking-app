import { FormProvider, useForm } from "react-hook-form";
import DetailSection from "./DetailSection";
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";
import { HotelType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";

export type HotelFromData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  pricePerNight: number;
  starRating: number;
  imageFiles: FileList; // 这里和后台定义的type略有不同，因此我们不能reuse后台的定义。
  imageUrls: string[]; // 这个是因为获取hotel数据时有imageUrls要展示，所以后期加上的。
}

type Props = {
  onSave: (hotelFormData: FormData) => void
  isLoading: boolean,
  hotel?: HotelType,
}

const ManageHotelForm = ({ onSave, hotel, isLoading }: Props) => {
  // 下面这行是注册表单用react-hook-form，做下对比。
  // const { register, watch, handleSubmit, formState: {errors} } = useForm<RegisterFormData>();
  
  // 我们只是assigning everything to a variable, 因为我们把form分成了不同的组件，
  // we need to use 'form provider', so our child components can get access to all the react-hook-form methods. 
  // 因此我们在<form>外层包裹了<FormProvider {...formMethods}>
  const formMethods = useForm<HotelFromData>();
  const { handleSubmit, reset } = formMethods;
  
  // 把获取到的hotel值reset form. 
  useEffect(()=> {
    reset(hotel);
  }, [hotel, reset]);

  const onSubmit = handleSubmit((formDataJson: HotelFromData) => {
    // create new FormData object & call our API
    // 我们要构造一个multipart form.
    const formData = new FormData();
    if(hotel) {
      formData.append("hotelId", hotel._id);
    }
    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);
    formData.append("description", formDataJson.description);
    formData.append("type", formDataJson.type);
    formData.append("pricePerNight", formDataJson.pricePerNight.toString());
    formData.append("starRating", formDataJson.starRating.toString());
    formData.append("adultCount", formDataJson.adultCount.toString());
    formData.append("childCount", formDataJson.childCount.toString());
    
    formDataJson.facilities.forEach((facility, index)=>{
      formData.append(`facilities[${index}]`, facility)
    });

    // [image1.jpg, image2.jpg, image3.jpg]
    // imageUrls = [image1.jpg, image2.jpg, image3.jpg]
    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index)=> {
        formData.append(`imageUrls[${index}]`, url);
      })
    }

    // formDataJson.imageFiles的类型是file list类型，转成array类型。
    Array.from(formDataJson.imageFiles).forEach((imageFile) => {
      // because we are working with image files and binary data, 
      // we don't have to specify an array like facilities[], 
      formData.append(`imageFiles`, imageFile);
    })

    onSave(formData)
  });

  return (
    // 这就是一种react context API, 就像我们定义的appContext. 
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailSection />
        <TypeSection />
        <FacilitiesSection />
        <GuestsSection />
        <ImagesSection />
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
    
  );
};

export default ManageHotelForm;