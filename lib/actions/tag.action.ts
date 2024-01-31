"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

interface Tag {
  _id: string;
  name: string;
}

// GET TOP INTERACTED TAGS
export async function getTopInteractedTags(
  params: GetTopInteractedTagsParams
): Promise<Tag[]> {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, limit = 3 } = params;

    // First we have to get the user to then get the tags:
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Then find interactins for the user and group by tags:
    // Later on we create a new entity caalled Interactions. Then we are able too  do all sorts of manipulaions on that model.

    // For now we return a static array of tags:
    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET ALL TAGS:
export async function getAllTags(
  params: GetAllTagsParams
): Promise<{ tags: Tag[] }> {
  try {
    // Connect to the database:
    await connectToDatabase();

    const tags = await Tag.find();

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
