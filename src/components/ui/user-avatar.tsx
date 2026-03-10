"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type User = {
  name?: string | null;
  image?: string | null;
};

type UserAvatarProps = React.ComponentPropsWithoutRef<typeof Avatar> & {
  user?: User;
};

export function UserAvatar({
  user,
  className,
  ...props
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const imageUrl = user?.image ?? "";
  const isValidImage = Boolean(imageUrl) && !imageError;

  return (
    <Avatar className={className} {...props}>
      {isValidImage ? (
        <div className="relative h-full w-full aspect-square">
          <Image
            src={imageUrl}
            alt={user?.name ?? "User"}
            fill
            sizes="40px"
            className="object-cover"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            unoptimized={imageUrl.includes("ui-avatars.com")}
          />
        </div>
      ) : (
        <AvatarFallback className="bg-zinc-900 text-white font-medium">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
