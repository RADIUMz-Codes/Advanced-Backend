import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
/** Steps
 * 1. get user data from frontend or postman
 * 2. validation - (not empty)
 * 3. check if user already exists: by username and email
 * 4. check for images, check for avatar
 * 5. upload to cloudnary
 * 6. create user object- create entry in db
 * 7. remove password and refresh token field from response
 * 8. check for user creation
 * 9. return res
 */
const registerUser = asyncHandler(async (req, res) => {
  // 1. get user data from frontend or postman
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  // 2. validation - (not empty)
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. check if user already exists: by username and email
  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or Email already exists");
  }
  // 4. check for images, check for avatar
  console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // 5. upload to cloudnary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // 6. create user object- create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username: username.toLowerCase()
  })

  // 7. remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  // 8. check for user creation
  if(!createdUser){
    throw new ApiError(500, 'something went wrong while regestering the user')
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Sucessfully")
  )
});

export { registerUser };
