"use client";
import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { viewQuestion } from "@/lib/actions/interaction.action";
import {
  downvoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";
import { formatBigNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "../ui/use-toast";

interface Props {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
  hasSaved?: boolean; // This is optional because we are using this only in the question page
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupVoted,
  downvotes,
  hasdownVoted,
  hasSaved,
}: Props) => {
  // Defining the path
  const pathname = usePathname();
  // Defining the router:
  const router = useRouter();

  // Function to save the question or answer
  const handleSave = async () => {
    // check if the user is logged in
    if (!userId) {
      return toast({
        // This function has been imported from the use-toast.tsx file
        title: "Please log in",
        description: "You must be logged in to perform this action",
      });
    }

    await toggleSaveQuestion({
      userId: JSON.parse(userId),
      questionId: JSON.parse(itemId),
      path: pathname,
    });

    // Show a toast:
    return toast({
      // This function has been imported from the use-toast.tsx file
      title: `Question successfully ${!hasSaved ? "saved in" : "removed from"} your collection`,
      variant: !hasSaved ? "default" : "destructive",
    });
  };

  // Function to vote the question or answer
  const handleVote = async (action: string) => {
    // check if the user is logged in
    if (!userId) {
      return toast({
        // This function has been imported from the use-toast.tsx file
        title: "Please log in",
        description: "You must be logged in to perform this action",
      });
    }

    // check if the user has already upvoted
    if (action === "upvote") {
      // We check if user is upvoting the question or answer
      if (type === "Question") {
        await upvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await upvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }

      // Show a toast:
      return toast({
        // This function has been imported from the use-toast.tsx file
        title: `Upvote successfully ${!hasupVoted ? "added" : "removed"}`,
        variant: !hasupVoted ? "default" : "destructive",
      });
    }

    // check if the user has already downvoted
    if (action === "downvote") {
      // We check if user is downvoting the question or answer
      if (type === "Question") {
        await downvoteQuestion({
          questionId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await downvoteAnswer({
          answerId: JSON.parse(itemId),
          userId: JSON.parse(userId),
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }

      // Show a toast:
      return toast({
        // This function has been imported from the use-toast.tsx file
        title: `Downvote successfully ${!hasdownVoted ? "added" : "removed"}`,
        variant: !hasdownVoted ? "default" : "destructive",
      });
    }
  };

  // Functionality to keep track whether a user has viewed a question or answer.
  // We want to call this whenever the itemId changes meaning tthe question or answer we are currently viewing has changed. Thee same for the other dependencies.
  // This inrements the view count for the question or answer and also keeps track of the user's interaction with the question or answer.
  useEffect(() => {
    viewQuestion({
      questionId: JSON.parse(itemId),
      userId: userId ? JSON.parse(userId) : undefined,
    });
  }, [itemId, userId, pathname, router]);

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasupVoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            alt="Upvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />

          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatBigNumber(upvotes)}
            </p>
          </div>
        </div>

        <div className="flex-center gap-1.5">
          <Image
            src={
              hasdownVoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            alt="Downvote"
            width={18}
            height={18}
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />

          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatBigNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === "Question" && ( // We only show the save button in the question page
        <Image
          src={
            hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          alt="Star"
          width={18}
          height={18}
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
