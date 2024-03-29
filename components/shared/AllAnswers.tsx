import React from "react";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";
import Pagination from "./Pagination";

interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;
}

const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: Props) => {
  // First we have to fetch all the answers for this question
  const result = await getAnswers({
    questionId,
    page: page ? +page : 1, // The page number is coming through Props this time. +page is changing it to a number. If it's not there, the default value is 1.
    sortBy: filter,
  });

  //   console.log("[AllAnswers] result", result.answers);

  return (
    <div className="mt-11 ">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>

        <Filter filters={AnswerFilters} />
      </div>

      <div>
        {result.answers.map((answer) => (
          <article key={answer._id} className="light-border border-b py-10">
            <div className="flex items-center justify-between">
              <div className="mb-4 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    alt="User picture"
                    width={18}
                    height={18}
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700">
                      {answer.author.name}
                    </p>

                    <p className="small-regular text-light400_light500 ml-1 mt-0.5 line-clamp-1">
                      answered {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex justify-end">
                <Votes
                  type="Answer" // Is this a question or an answer?
                  itemId={JSON.stringify(answer._id)} // The id of the question or answer
                  userId={JSON.stringify(userId)} // The id of the user
                  upvotes={answer.upvotes.length} // The number of total upvotes
                  hasupVoted={answer.upvotes.includes(userId)} // If the user has upvoted his Id will be in the upvotes array
                  downvotes={answer.downvotes.length} // The number of total downvotes
                  hasdownVoted={answer.downvotes.includes(userId)} // If the user has downvoted his Id will be in the downvotes array
                />
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 w-full">
        <Pagination
          pageNumber={page ? +page : 1} // The page number is taken from the URL query parameter. If it's not there, the default value is 1.
          isNext={result.isNextAnswers} // The isNext prop is taken from the result object. It's a boolean value that tells us if there are more questions to show.
        />
      </div>
    </div>
  );
};

export default AllAnswers;
