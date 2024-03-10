"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

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

    // Then we have to destructure the params:
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // Teh we define the query object to filter the tags:
    const query: FilterQuery<typeof Tag> = {}; // Here we declare the query object to filter the tags

    // If there is a searchQuery, we want to filter the tags by the name:
    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }]; // We use the $regex operator to match the name with the searchQuery. The $options "i" makes the search case insensitive.
    }

    // If we have a filter we have to filter the questions by the filter. We initialize the sortOptions object:
    let sortOptions = {};

    // Then setting the switch statement for the filter:
    switch (filter) {
      case "popular":
        sortOptions = { questions: -1 }; // Sort the tags with the most questions in descending order
        break;

      case "recent":
        sortOptions = { createdOn: -1 }; // Sort the tags by createdAt in descending order
        break;
      case "name":
        sortOptions = { name: 1 }; // Sort the tags by name in ascending order
        break;
      case "old":
        sortOptions = { createdOn: 1 }; // Sort the tags by createdAt in ascending order
        break;

      default:
        break;
    }

    // Pagination: Here we have to get the total amount of tags:
    const totalTags = await Tag.countDocuments(query);

    const tags = await Tag.find(query)
      .skip(skipAmount) // We skip the documents based on the skipAmount
      .limit(pageSize) // We limit the number of documents to pageSize
      .sort(sortOptions);

    // Pagination: If the total amount of documents is greater than the amount of questions we have to show on the page, we have more pages with questions to show:
    const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET QUESTIONS RELATED TO TAG:
export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destructure the params:
    const { tagId, searchQuery, page = 1, pageSize = 10 } = params;

    // Pagination: First we have to calculate the number of documents to skip based on the page number and the page size:
    const skipAmount = (page - 1) * pageSize; // Example: If we are on page 2 and the page size is 20, we have to skip 20 documents. (20 * (2 - 1) = 20 * 1 = 20)

    // We define the query object to filter the questions related to the tag:
    // In Typescript: query of type FilterQuery<typeof Question> = searchQuery
    const tagFilter: FilterQuery<ITag> = { _id: tagId }; // Here we filter the tag by the tagId

    // Get the tag:
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery // We want to match the questions related to the tag with the searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } } // We want to filter the questions by the title. We use the $regex operator to match the title with the searchQuery. The $options "i" makes the search case insensitive.
        : {}, // If there is no searchQuery, we return an empty object
      options: {
        sort: { createdAt: -1 }, // Sort the questions by createdAt in descending order
        skip: skipAmount, // We skip the documents based on the skipAmount
        limit: pageSize, // We limit the number of documents to pageSize
      },

      populate: [
        // We can populate the saved questions with the author and tags
        { path: "tags", model: Tag, select: "_id name" }, // We want to populate the tags of the related questions with the _id and name
        { path: "author", model: User, select: "_id clerkId name picture" }, // We want to populate the author of the saved questions with the _id, name and clerkId and picture
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    // Pagination: If the total amount of documents is greater than the amount of questions we have to show on the page, we have more pages with questions to show:
    const isNext = tag.questions.length >= pageSize;

    // Here we have to extract the related questions from the tag:
    const questions = tag.questions;

    // Then we reeturn the saved questions:
    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET HOT TAGS:
export async function getTopPopularTags() {
  try {
    // Connect to the database:
    await connectToDatabase();

    // We get the top popular tags from the database. We use the aggregate method to get the top popular tags:
    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
