import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { image } = await req.json() // Data URL format: data:image/jpeg;base64,...
    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    let imageUrl = image // default is the base64 data URL

    if (isCloudinaryConfigured) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "student_attendance_profiles",
          resource_type: "image"
        })
        imageUrl = uploadResponse.secure_url
      } catch (cloudinaryError) {
        console.error("Cloudinary upload failed, using local base64 fallback:", cloudinaryError)
      }
    } else {
      console.log("Cloudinary not configured. Storing image as base64 data URL in MongoDB.")
    }

    // Update the student profile photo in the database
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: { profilePhoto: imageUrl }
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl, 
      profilePhoto: imageUrl,
      studentProfile: updatedProfile 
    })
  } catch (error: any) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: error.message || "Failed to upload webcam photo" }, { status: 500 })
  }
}
