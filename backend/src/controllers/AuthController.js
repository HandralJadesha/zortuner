import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { sendOtpEmail } from '../utils/mailer.js';

const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET || 'layerly_jwt_secret_key_change_me_in_prod',
    { expiresIn: '30d' }
  );
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password, contact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    const otpCode = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = new User({
      name,
      email,
      password,
      contact,
      otp: { code: otpCode, expiresAt: otpExpires },
      isEmailVerified: false
    });

    await user.save();
    await sendOtpEmail(email, otpCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return next(new AppError('No verification code requested', 400));
    }

    if (user.otp.code !== code) {
      return next(new AppError('Invalid verification code', 400));
    }

    if (new Date() > user.otp.expiresAt) {
      return next(new AppError('Verification code expired', 400));
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.role, user.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Enforce subdomain access for admin accounts (allow localhost for dev)
    if (user.role === 'admin') {
      const origin = req.headers.origin || req.headers.referer || '';
      if (!origin.includes('admin.') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return next(new AppError('Admin login is only allowed through the secure admin portal', 403));
      }
    }

    const token = generateToken(user._id.toString(), user.role, user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileAddress = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { street, city, state, postalCode, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const isDuplicate = user.addresses.some(
      (addr) =>
        addr.street.trim().toLowerCase() === street.trim().toLowerCase() &&
        addr.city.trim().toLowerCase() === city.trim().toLowerCase() &&
        addr.state.trim().toLowerCase() === state.trim().toLowerCase() &&
        addr.postalCode.trim() === postalCode.trim()
    );

    if (!isDuplicate) {
      user.addresses.push({ street, city, state, postalCode, country, isDefault });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: isDuplicate ? 'Address already exists' : 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

export const editProfileAddress = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { addressId } = req.params;
    const { street, city, state, postalCode, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    const address = user.addresses.id(addressId);
    if (!address) return next(new AppError('Address not found', 404));

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfileAddress = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    const address = user.addresses.id(addressId);
    if (!address) return next(new AppError('Address not found', 404));

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        isEmailVerified: true
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.role, user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    if (user.role === 'admin') {
      return next(new AppError('Cannot delete admin users', 403));
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
