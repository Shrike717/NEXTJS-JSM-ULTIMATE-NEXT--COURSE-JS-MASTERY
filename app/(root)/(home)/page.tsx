import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import {
  getQuestions,
  getRecommendedQuestions,
} from "@/lib/actions/question.action";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
// import Loading from "./loading";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs";

// This is the metadata for the page
export const metadata: Metadata = {
  title: "Home | DevFlow",
  description: `A community-driven platform for asking and answering programming questions.`,
};

export default async function Home({
  searchParams,
}: SearchParamsProps): Promise<JSX.Element> {
  const { userId } = auth();

  let result;

  if (searchParams.filter === "recommended") {
    // Fetch recommended questions
    if (userId) {
      result = await getRecommendedQuestions({
        userId, // The user ID is taken from the session. From auth()
        searchQuery: searchParams.q,
        page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
      });
    } else {
      // If the user is not logged in, we return an empty result object
      result = { questions: [], isNext: false };
    }
  } else {
    // Fetching all questions from the database:
    result = await getQuestions({
      searchQuery: searchParams.q,
      filter: searchParams.filter,
      page: searchParams.page ? +searchParams.page : 1, // The page number is taken from the URL query parameter. +searchParams.page is changing it to a number. If it's not there, the default value is 1.
    });
  }
  // Fake loading variable to simulate loading state
  //   const isLoading = true;

  //   if (isLoading) return <Loading />;

  return (
    <>
      {/* flex-col-reverse: On small devices the button is shhown before the text */}
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Link
          href="/ask-question"
          className="flex justify-end max-sm:min-w-full"
        >
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        {/* Reusable Compnent */}
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        {/* Reusable Compnent Filter Select */}
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      {/* Compnent für Filter Tags auf grossen Screens */}
      <HomeFilters />

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question) => (
            <QuestionCard // Reusable Component QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult // Reusable Component NoResult
            title="There's no question to show"
            description="Be the first one to ask a question by clicking the button below 🚀"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      {/* Here is the Pagination component */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams.page ? +searchParams.page : 1} // The page number is taken from the URL query parameter. If it's not there, the default value is 1.
          isNext={result.isNext} // The isNext prop is taken from the result object. It's a boolean value that tells us if there are more questions to show.
        />
      </div>
    </>
  );
}
