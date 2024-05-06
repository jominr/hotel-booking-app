import { useFormContext } from 'react-hook-form';
import { HotelFromData } from './ManageHotelForm';

const ImagesSection = () => {
  const { 
    register, 
    formState: { errors },
    watch,
    setValue, 
  } = useFormContext<HotelFromData>();
  // 这个form在response里是存了imageUrls的。
  const existingImageUrls = watch("imageUrls");

  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imageUrl: string
  ) => {
    event.preventDefault();
    setValue(
      "imageUrls",
      existingImageUrls.filter((url)=>url !== imageUrl)
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      <div className='border rounded p-4 flex flex-col gap-4'>
        {existingImageUrls && (
          <div className='grid grid-cols-6 gap-4'>
            {
              existingImageUrls.map((url) => (
                // tailwind，group的概念, button上有group:hover, 相当于就是这个div hover
                <div key={url} className='relative group'>
                  {/* the image stretches to match its container, crop the image so that it doesn't cause any overflow */}
                  <img src={url} alt="hotel image" className='min-h-full object-cover'/>
                  {/* inset: top, bottom, right, left都是0，整个罩住*/}
                  <button onClick={(event) => handleDelete(event, url)} className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white'>
                    Delete
                  </button>
                </div>
              ))
            }
          </div>
        )}

        <input
          type="file"
          // let the user select multiple image files 
          multiple
          // the input will only accept files of type image
          accept="image/*"
          className='w-full text-gray-700 font-normal'
          {...register("imageFiles", {
            validate: (imageFiles)=> {
              const totalLength = imageFiles.length + (existingImageUrls?.length || 0);
              if (totalLength === 0) {
                return "At least one image should be added"
              }
              if (totalLength > 6) {
                return "Total number of images cannot be more than 6"
              }
              return true;
            }
          })} />
      </div>
      {errors.imageFiles && (
        <span className="text-red-500 text-sm font-bold">
          {errors.imageFiles.message}
        </span>
      )}
    </div>
  );
};

export default ImagesSection;