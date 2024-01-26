"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";

// Here we have all the actions for the questions model:

/* eslint-disable */
export async function createQuestion(params: any) {
  //   console.log("[createQuestion] params:", params);
  try {
    // Connect to the database:
    await connectToDatabase();

    // Then we have to destruct the params:
    // path is URL that has to be reloaded after the question is created. Next has to know that something has changed.
    const { title, content, tags, author, path } = params;

    // Create the question:
    const question = await Question.create({
      title,
      content,
      author,
    });

    // Add the tags to the question:
    const tagDocuments = [];

    // Create the tags or get them if they already exist:
    for (const tag of tags) {
      // Check if the tag already exists:
      const existingTag = await Tag.findOneAndUpdate(
        // The first argument allows us to find the tag:
        // Whenever we have to find sth. more complex we can use the $regex operator. i means case insensitive.
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // The second argument allows us to do sth with the tag: $setOnInsert allows us to set the name of the tag and $push allows us to add the question to the questions array.
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        // The third argument allows us to create the tag if it doesn't exist:
        { upsert: true, new: true }
      );
      tagDocuments.push(existingTag._id);
    }

    // Add the tags to the question:
    await Question.findByIdAndUpdate(question._id, {
      // For each tag document we push the id to the tags array:
      $push: { tags: { $each: tagDocuments } },
    });

    // We need to create an interaction record for the users ask_question action. We want to track that this user created that question.

    // And  then we want to increment authors reputation by 5 points for creating a question:
  } catch (error) {
    throw error;
    console.log(error);
  }
}
/* eslint-enable */
