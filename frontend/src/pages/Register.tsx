import { useForm } from "react-hook-form";
// react-query, making fetch request, storing any state, and handing any erros
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from '../api-client'
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

export type RegisterFormData = {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
}

const Register = () => {
  // 
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  // 这个form的数据类型是RegisterFormData，
  // ...register, spreading these individual properties onto our input, like onClick, onChange. input校验
  // errors存储了form的错误信息
  // watch在比对password是监听到了password的输入值
  const { 
    register, 
    watch, 
    handleSubmit, 
    formState: {errors}
  } = useForm<RegisterFormData>();

  // useMutation(a fetch request, {onSuccess(), onError()})
  // mutation展开 {mutate, loading, isSucess, ...}
  const mutation = useMutation(apiClient.register, {
    onSuccess: async () => {
      showToast({message: "Registration Success!", type: "SUCCESS"});
      await queryClient.invalidateQueries("validateToken");
      navigate("/");
    },
    onError: (error: Error) => {
      showToast({message: error.message, type: "ERROR"})
    }
  });

  const onSubmit = handleSubmit((data)=> {
    mutation.mutate(data);
  })

  return (
    <div>
      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <h2 className="text-3xl font-bold">Create an Account</h2>
        {/* mobile css first */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* label 包裹 input */}
          <label className="text-gray-700 text-sm font-bold flex-1">
            First Name
            <input
              className="border rounded w-full py-1 px-2 font-normal" 
              {...register("firstName", {required: "This field is required"})}
            ></input>
            {errors.firstName && (
              <span className="text-red-500">{errors.firstName.message}</span>
            )}
          </label>

          <label className="text-gray-700 text-sm font-bold flex-1">
            Last Name
            <input
              className="border rounded w-full py-1 px-2 font-normal" 
              {...register("lastName", {required: "This field is required"})}
            ></input>
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
          </label>
        </div>

        <label className="text-gray-700 text-sm font-bold flex-1">
          Email
          <input
            type="email"
            className="border rounded w-full py-1 px-2 font-normal" 
            {...register("email", {required: "This field is required"})}
          ></input>
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </label>
        

        <label className="text-gray-700 text-sm font-bold flex-1">
          Password
          <input
            type="password"
            className="border rounded w-full py-1 px-2 font-normal" 
            {...register("password", {
              required: "This field is required", 
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              },
            })}
          ></input>
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </label>
        

        <label className="text-gray-700 text-sm font-bold flex-1">
          Confirm Password
          <input
            type="password"
            className="border rounded w-full py-1 px-2 font-normal" 
            {...register("confirmPassword", {
              validate: (val)=> {
                if(!val) {
                  return "This filed is required";
                } else if(watch("password") !== val) {
                  return "Your passwords do no match";
                }
              }
            })}
          ></input>
          {errors.confirmPassword && (
            <span className="text-red-500">{errors.confirmPassword.message}</span>
          )}
        </label>
        

        <span>
          <button type="submit" className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-x1">
            Create Account
          </button>
        </span>


      </form>
    </div>
  );
};

export default Register;