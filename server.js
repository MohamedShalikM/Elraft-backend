import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "./models/User.js";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://elraft-fashion.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview deployments for this frontend project.
  return /^https:\/\/elraft-fashion(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin, like Postman or server-to-server calls.
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbState: mongoose.connection.readyState,
  });
});

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database unavailable" });
  }

  return next();
});

app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
        const user = await User.findOne({googleId:profile.id})
        if(user){
            return done(null,user);
        }
        const email = profile.emails?.[0]?.value;
        const newUser = await User.create({
            name:profile.displayName,
            googleId:profile.id,
            email
        })
        return done(null,newUser);
  }catch(err){
    return done(err,null);
}}
));

app.get("/auth/google",passport.authenticate("google",{
    scope:["profile","email"]
}));

app.get(
  "/auth/google/cb",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
  }),
  (req, res) => {
    // console.log("Google user:", req.user);
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  }
);

app.get("/api/auth/me", (req, res) => {
  //  console.log("isAuthenticated:", req.isAuthenticated());
  // console.log("session:", req.session);
  // console.log("user:", req.user);
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      message: "Not logged in",
    });
  }

  res.json({
    user: req.user,
  });
});


app.post("/login",(req,res,next)=>{
    passport.authenticate("local",(err,user,info)=>{
        if(err){return next (err)};
        if(!user){
            return res.status(401).json({message: info?.message || "Login Unsuccessful"})
        }
        req.logIn(user,(err)=>{
            if(err){return next(err);}
            return res.json({message:"Login Successful",user});
        })
    })(req,res,next);
})


const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/elraft";

  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.warn(
      "MONGODB_URI is not configured. Falling back to local MongoDB at mongodb://127.0.0.1:27017/elraft",
    );
  }

  await mongoose.connect(mongoUri);

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", async (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. The backend may already be running. Stop the existing process or change PORT in .env.`,
      );
    } else {
      console.error("Server failed to start:", error.message);
    }

    await mongoose.connection.close();
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});

export default app
