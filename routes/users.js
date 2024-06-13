const multer = require('multer')
const { userRegister, userLogin, profile, userUpdate, userLogout, userImg, forgotPassword, resetPassword, resetPasswordPost} = require('../controllers/userController')
const isAuth = require('../middlewares/auth')

const router = require('express').Router()
const upload = multer()

//  api/user/whatsapp-webhook
router.get("/whatsapp-webhook",(req,res) => {
  const VERIFY_TOKEN = "thamer_token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("webhook verification triggered");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Verification token mismatch");
  }
})

//  api/user/whatsapp-webhook
router.post("/whatsapp-webhook",(req,res) => {
  console.log("Received webhook: ", req.body.entry[0].changes)
  console.log("Received metadata: ", req.body.entry[0].changes[0].value.metadata)
  console.log("Received contacts: ", req.body.entry[0].changes[0].value.contacts)
  console.log("Received messages: ", req.body.entry[0].changes[0].value.messages)
  res.status(200).send();
})

// forgot password
router.post('/forgot-password',forgotPassword)
router.get('/reset-password/:id/:token',resetPassword)
router.post('/reset-password/:id/:token',resetPasswordPost)

// sign up => /api/user/register
router.post('/register', userRegister)

// login => /api/user/login
router.post('/login', userLogin)

// logout => /api/user/logout
router.post('/logout', userLogout)

// update profile => /api/user/update
router.put('/update',isAuth, userUpdate)

// profile => /api/user/profile
router.get('/profile', isAuth ,profile)


module.exports = router
