import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

import { connectToDB } from "@utils/database.js";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  async session({ session }) {
    const sessionUser = await User.findOne({
      email: session.user.email,
    });

    session.user.id = sessionUser._id.toString();

    return session;
  },

  async signIn({ profile }) {
    // *****Imp Fact to keep in mind
    // every nextjs route is something known as serverless route
    // serverless -> Lambda -> dynamodb
    // which means that is Lambda Func which opens up only everytime when it get called
    // So everytime it gets call we need to to spinup server and make a connection to database

    try {
      await connectToDB();
      const userExist = await User.findOne({ email: profile.email });

      if (!userExist) {
        await User.create({
          email: profile.email,
          username: profile.name.replace(" ", "").toLowerCase(),
          image: profile.picture,
        });
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export { handler as GET, handler as POST };
