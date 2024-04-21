import { hotelFacilities } from "../config/hotel-options-config";

type Props = {
  selectedFacilities: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>)=> void;
}

const FacilitiesFilter = ({selectedFacilities, onChange}: Props) => {
  return (
    <div className="border-b borde-slate-300 pb-5">
      <h4 className="text-md font-semibold m-2">Facilities</h4>
      {hotelFacilities.map((facility)=>(
        <label key={facility} className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded"
            value={facility}
            checked={selectedFacilities.includes(facility)}
            onChange={onChange}
          />
          <span>{facility}</span>
        </label>
      ))}
    </div>
  );
};

export default FacilitiesFilter;