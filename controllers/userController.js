const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../modals/userModal.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const bcrypt = require('bcryptjs');
const { authMiddleware } = require("../middlewares/index");

const signupBody = zod.object({
  email: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string().min(6), // Ensure password has a minimum length
  phone:zod.string(),
//   otp:zod.number(),
//   otp_expiry:zod.string()
});

router.post("/signup", async (req, res) => {
  try {
    // Input validation check
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Input specified in incorrect format",
      });
    }

    // Existing user check
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(409).json({
        message: "Existing user",
      });
    }

    const hashedpassword = await bcrypt.hash(req.body.password, 10);

    // When both checks are successful, add user to the database
    const user = await User.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone:req.body.phone,
      password: hashedpassword,
      firstlogin: true,
      otp:123456,
      otp_expiry:"test-date"
    });

    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_SECRET);

    res.status(201).json({
      message: "User created successfully",
      token: token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

//signin route

const signinBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      message: "Input specified in incorrect format",
    });
  }

  const prev_user = await User.findOne({
    email: req.body.email,
  });

  if (!prev_user) {
    return res.status(401).json({
      message: "Not a registered user",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    prev_user.password
  );

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        userId: prev_user._id,
      },
      JWT_SECRET
    );

    return res.status(200).json({
      message: "Welcome user, you are logged in",
      token: token,
      user: {
        id: prev_user._id,
        username: prev_user.username,
        // Add other user details if needed
      },
    });
  }

  res.status(401).json({
    message: "Password incorrect",
  });
});

//update route

// const updateBody = zod.object({
//     password:zod.string().optional(),
//     firstName:zod.string().optional(),
//     lastName:zod.string().optional(),
// })

// router.put("/update",authMiddleware,async(req,res) => {
//     const {success} = updateBody.safeParse(req.body)

//     if(!success){
//         return res.status(411).json({
//              message: "Input specified in wrong format"
//         })
//     }

//     await User.updateOne({_id:req.userId}, req.body);

//     res.json({
//         message:"Details updated successfully"
//     })
// })

router.get("/details", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        username: userDetails.username,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        _id: userDetails._id,
        position: userDetails.position,
        positionseniorityindex: userDetails.positionseniorityindex,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Route to send the details of the users to appear on the user's page according to searching
router.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const userPositionIndex = req.query.userPositionIndex;
  const userid = req.query.userid;

  const users = await User.find({
    $and: [
      {
        $or: [
          {
            firstName: {
              $regex: filter,
            },
          },
          {
            lastName: {
              $regex: filter,
            },
          },
        ],
      },
      {
        positionseniorityindex: { $lte: userPositionIndex },
      },
      {
        _id: { $ne: userid },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
      position: user.position,
      positionseniorityindex: user.positionseniorityindex,
    })),
  });
});

module.exports = router;
