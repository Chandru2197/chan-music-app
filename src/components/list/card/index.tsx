"use client";

import { Music } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { TrackType, useAudio } from "@state/store/audio";
import { useAlertUnAuthenticate } from "@state/store/alert";
import { useSession } from "next-auth/react";
import { FaPlay, FaPause } from "react-icons/fa";
import { parsedUrl } from "@lib/functions/parsedUrl";
import { MouseEvent, useCallback } from "react";
import { useRecentlyPlayed } from "@state/store/history";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";

type CardProps = {
  music: Music;
  listOfMusic: Music[];
  className?: string;
};

const Card = ({ listOfMusic, music, className }: CardProps) => {
  const onPressedChangeTrack = useAudio((state) => state.onPressedChangeTrack);

  const router = useRouter();

  const onPressedSortPlaying = useRecentlyPlayed(
    (state) => state.onPressedSortPlaying
  );

  const onPressedChangeLoadHistory = useRecentlyPlayed(
    (state) => state.onLoadSetHistoryMusic
  );

  const onPressedChangeAudioSrc = useAudio(
    (state) => state.onPressedChangedAudioSrc
  );

  const track = useAudio((state) => state.audioSrc);

  const onPressedAlertUnAuthenticate = useAlertUnAuthenticate(
    (state) => state.onPressedChangeAlertUnauthenticate
  );

  const { data: session } = useSession();

  const onPressedSetAudio = useCallback(async () => {
    if (!session || !session.user) {
      onPressedAlertUnAuthenticate(music.coverImage);
    } else {
      onPressedChangeAudioSrc(music);

      onPressedChangeTrack({
        currentAudioSrc: music.musicUrl,
        listOfMusic,
        type: TrackType.Default,
      });

      onPressedChangeLoadHistory(
        [
          music,
          ...listOfMusic.filter((musicc) => musicc.id !== music.id).slice(0, 4),
        ].slice(0, 4)
      );

      onPressedSortPlaying(music);

      const url = parsedUrl({
        path: "api/song",
        searchParams: [{ key: "songId", value: music.id }],
      });

      try {
        const resp = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });

        const data = await resp.json();
      } catch (e: unknown) {
        console.error(e);
      }
    }
  }, [
    listOfMusic,
    music,
    onPressedAlertUnAuthenticate,
    onPressedChangeAudioSrc,
    onPressedChangeLoadHistory,
    onPressedChangeTrack,
    onPressedSortPlaying,
    session,
  ]);

  const onPressedRedirectToTrack = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    console.log("CLICKED");

    router.push(`/track/${music.id}`);
  };

  return (
    <>
      <article
        onClick={onPressedRedirectToTrack}
        className={twMerge(
          `w-full h-[300px] cursor-pointer bg-[#232323] hover:bg-white/20 transition-colors rounded-md p-3 group ${className} flex flex-col justify-start items-center gap-4`
        )}
      >
        <div className="w-full h-[70%] relative overflow-hidden rounded-md">
          <Image
            className="object-cover "
            src={music.largeImage}
            alt={music.title}
            fill
          />
          <div
            style={{
              transform:
                track?.musicUrl === music.musicUrl ? "translateY(0px)" : "",
            }}
            onClick={onPressedSetAudio}
            className={`absolute bottom-[10px] right-[10px] w-max opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 h-max p-4 rounded-full bg-green-500 hover:bg-green-600 ${
              track?.musicUrl === music.musicUrl && "translate-y-0 opacity-100"
            } text-stone-950 transition-all`}
          >
            {track?.musicUrl === music.musicUrl ? (
              <FaPause size={25} />
            ) : (
              <FaPlay size={25} />
            )}
          </div>
        </div>

        <section className="w-full flex flex-col justify-start items-start gap-2">
          <h4 className="w-full text-xl font-[700] text-stone-200 capitalize lg:text-xl font-400 whitespace-nowrap text-ellipsis overflow-hidden">
            {music.title}
          </h4>
          <p className="w-full text-lg lg:text-lg text-stone-400 line-clamp-2 text-ellipsis overflow-hidden">
            {music.description}
          </p>
        </section>
      </article>
    </>
  );
};

export default Card;
