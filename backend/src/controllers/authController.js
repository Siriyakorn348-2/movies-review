const userService = require('../services/userService');
const { generateToken } = require('../utils/jwt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .jpg, .jpeg, และ .png เท่านั้น'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

exports.register = async (req, res, next) => {
  try {
    const { email, password, username, img } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'กรุณากรอก email, password, และ username' });
    }
    const user = await userService.createUser({ email, password, username, img });
    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: { id: user.id, email: user.email, username: user.username, img: user.img },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'อีเมลหรือชื่อผู้ใช้ถูกใช้งานแล้ว' });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอก email และ password' });
    }
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'ไม่พบผู้ใช้' });
    }
    const validPassword = await userService.comparePassword(user, password);
    if (!validPassword) {
      return res.status(400).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }
    const token = generateToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, img: user.img },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    console.log('User fetched in getMe:', user); 
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        img: user.img, 
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    next(error);
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'ออกจากระบบสำเร็จ' });
};

exports.updateProfile = async (req, res, next) => {
  try {
    console.log('Received PUT /api/auth/profile request');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { email, username, password } = req.body;
    const userId = req.user.id;

    if (!email && !username && !password && !req.file) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลที่ต้องการแก้ไข' });
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (password) updateData.password = password;

    if (req.file) {
      console.log('Uploading file to Cloudinary:', req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_images',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        ],
      });
      updateData.img = result.secure_url;
      console.log('Cloudinary upload successful:', result.secure_url);

      try {
        const fs = require('fs');
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('Temporary file deleted:', req.file.path);
        } else {
          console.log('Temporary file not found:', req.file.path);
        }
      } catch (fileError) {
        console.error('Error deleting temporary file:', fileError.message);
      }
    }

    console.log('Updating user with data:', updateData);
    const updatedUser = await userService.updateUser(userId, updateData);
    console.log('User updated:', updatedUser);

    res.json({
      message: 'แก้ไขโปรไฟล์สำเร็จ',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        img: updatedUser.img,
      },
    });
  } catch (error) {
    console.error('Error in updateProfile:', error.message);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'อีเมลหรือชื่อผู้ใช้ถูกใช้งานแล้ว' });
    }
    next(error);
  }
};;

exports.upload = upload;