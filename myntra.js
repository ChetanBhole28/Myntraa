const express = require("express");
const router = express.Router();
const connection = require('./database');
const randomstring = require('randomstring');

const app = express();

app.use(router);

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.params) {
      res.status(400).send({
        message: "invalid request",
      });
    }
    let queryString = `SELECT full_name, mobile_no, email_id, gender, d_o_b, location from users where user_id = ?`;
    const [result] = await connection.promise().execute(queryString, [id]);

    if (result.length === 0) {
      res.status(404).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "Successfully user received",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const queryString =
      "SELECT product_name, product_details, rating, country_of_origin, discount FROM products ORDER BY price LIMIT ? OFFSET ? ";
    const [results] = await connection
      .promise()
      .execute(queryString, [limit, offset]);
    const countQueryString = "SELECT COUNT(product_id) as count FROM products";
    const [countResults] = await connection.promise().execute(countQueryString);

    const responseBody = {
      message: "Products list",
      list: results,
      count: countResults[0].count,
    };
    res.status(200).send(responseBody);
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addWishlist = async (req, res) => {
  try {
    const { user_id, product_id, is_active } = req.body;
    if (!user_id && !product_id && !is_active) {
      res.status(400).send({
        message: "invalid request",
      });
    }

    let queryString = `insert into wishlist
    (user_id, product_id, is_active)
     values (?, ?, ?)`;
    const [result] = await connection
      .promise()
      .execute(queryString, [user_id, product_id, is_active]);

    res.status(201).send({
      message: "Wishlist added successfully",
      result,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      res.status(400).send({
        message: "invalid request",
      });
    }
    const queryString =
      "SELECT wishlist.wishlist_id, users.user_id,users.full_name AS user_name,products.product_id,products.product_name AS product_name FROM wishlist JOIN users ON wishlist.user_id = users.user_id JOIN products ON wishlist.product_id = products.product_id where wishlist.user_id = ? ";
    const [results] = await connection
      .promise()
      .execute(queryString, [user_id]);
    const countQueryString = "SELECT COUNT(wishlist_id) as count FROM wishlist";
    const [countResults] = await connection.promise().execute(countQueryString);

    const responseBody = {
      message: "Successfully received wishlists",
      list: results,
      count: countResults[0].count,
    };
    res.status(200).send(responseBody);
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        message: "Invalid request: ID is missing",
      });
    }

    const queryString = "UPDATE wishlist SET is_active = 0 WHERE wishlist_id = ?";
    const [result] = await connection.promise().execute(queryString, [id]);

    const responseBody = {
      message: "Successfully deleted wishlist",
      list: result
    };
    res.status(200).send(responseBody);
  } catch (error) {

    res.status(500).send({ message: "Internal Server Error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password) {
      res.status(400).send({
        message: "Email and Password Required",
      });
    }
    let queryString = ` SELECT full_name, mobile_no, gender, d_o_b, location FROM users WHERE email_id = ? AND password = ?`;
    const [result] = await connection.promise().execute(queryString, [email_id, password]);

    if (result.length === 0) {
      res.status(401).send({
        message: "Invalid email or password",
      });
    }
    res.status(200).send({
      message: "Logged In Successfully",
      result
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
};

const userRegister = async (req, res) => {
  try {
    const { full_name, mobile_no, email_id, password, gender, d_o_b, location } = req.body;

    let checkString = `SELECT * FROM users WHERE email_id = ?`;
    const [checkResult] = await connection.promise().execute(checkString, [email_id]);

    if (checkResult.length > 0) {
       res.status(409).send({
        message: "Email Already Exist"
      });
  }

    if (!full_name || !mobile_no || !email_id || !password || !gender || !d_o_b || !location) {
      res.status(400).send({
        message: "Please Enter Complete Details",
      });
    }
    let queryString = `INSERT INTO users(full_name, mobile_no, email_id, password, gender, d_o_b, location) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.promise().execute(queryString, [full_name, mobile_no, email_id, password, gender, d_o_b, location]);

    res.status(200).send({
      message: "User Registered Successfully",
      result
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
};


const otpGenerate = async (req, res) => {
  
 
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Email Required",
      });
    }


    function generateOTP() {
      return randomstring.generate({
          length: 4,
          charset: 'numeric'
      });
    }
  const otp = generateOTP();

    let otpString = `INSERT INTO otp (email, otp_code) VALUES (?, ?)`;
    const [result] = await connection.promise().execute(otpString, [email, otp]);

    res.status(200).send({
      message: "Otp Generated Successfully",
      result
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
};


//User API
router.get("/users/:id", getUserById);

//Product API
router.get("/products", getProducts);

//WishList API
router.post("/wishlist", addWishlist);
router.get("/wishlist/:user_id", getWishlist);
router.put("/wishlist/:id", deleteWishlist);

//Login API       
router.post("/login", userLogin);

//Register API
router.post("/register", userRegister);

//Otp API
app.post("/forgetpassword", otpGenerate);

module.exports = router;




