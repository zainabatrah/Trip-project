const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Profile = require("../models/Profile");
const SocialPost = require("../models/SocialPost");
const Story = require("../models/Story");

/*
 * This line is required.
 */
const Friendship = require(
  "../models/Friendship"
);

const {
  requireAuth,
} = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

/*
|--------------------------------------------------------------------------
| Social upload configuration
|--------------------------------------------------------------------------
*/

const socialUploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "social"
);

fs.mkdirSync(socialUploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(
    _req,
    _file,
    callback
  ) {
    callback(
      null,
      socialUploadDirectory
    );
  },

  filename(
    _req,
    file,
    callback
  ) {
    const extension =
      path
        .extname(
          file.originalname
        )
        .toLowerCase() ||
      ".jpg";

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() *
          1_000_000_000
      )}${extension}`;

    callback(
      null,
      filename
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter(
    _req,
    file,
    callback
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {
      const error = new Error(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      error.status = 400;

      return callback(
        error
      );
    }

    callback(
      null,
      true
    );
  },
});

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function validId(value) {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}

function makePairKey(
  firstUserId,
  secondUserId
) {
  return [
    String(firstUserId),
    String(secondUserId),
  ]
    .sort()
    .join(":");
}

function mediaPath(file) {
  return file
    ? `/uploads/social/${file.filename}`
    : "";
}

function splitList(value) {
  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) =>
        String(item)
          .trim()
      )
      .filter(Boolean);
  }

  return String(
    value || ""
  )
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

function escapeRegex(value) {
  return String(
    value || ""
  ).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function safeUser(
  user,
  profile
) {
  if (!user) {
    return null;
  }

  return {
    id:
      user._id?.toString() ||
      user.id,

    _id:
      user._id?.toString() ||
      user.id,

    fullName:
      user.fullName ||
      "Traveler",

    name:
      user.fullName ||
      "Traveler",

    role:
      user.role ||
      "client",

    avatar:
      profile?.avatar ||
      "",

    location:
      profile?.location ||
      "",

    travelStyle:
      profile?.travelStyle ||
      "Mixed",
  };
}

async function getOrCreateProfile(
  userId
) {
  try {
    return await Profile.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $setOnInsert: {
          user: userId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
  } catch (error) {
    /*
     * Protection against two simultaneous
     * profile-creation requests.
     */
    if (error?.code === 11000) {
      const existingProfile =
        await Profile.findOne({
          user: userId,
        });

      if (existingProfile) {
        return existingProfile;
      }
    }

    throw error;
  }
}

async function getFriendCount(
  userId
) {
  return Friendship.countDocuments({
    status: "accepted",

    $or: [
      {
        requester:
          userId,
      },

      {
        recipient:
          userId,
      },
    ],
  });
}

async function getRelationship(
  firstUserId,
  secondUserId
) {
  if (
    String(firstUserId) ===
    String(secondUserId)
  ) {
    return {
      status: "self",
      direction: "self",
      friendshipId: "",
    };
  }

  const friendship =
    await Friendship.findOne({
      pairKey:
        makePairKey(
          firstUserId,
          secondUserId
        ),
    }).lean();

  if (!friendship) {
    return {
      status: "none",
      direction: "none",
      friendshipId: "",
    };
  }

  return {
    status:
      friendship.status,

    direction:
      String(
        friendship.requester
      ) ===
      String(firstUserId)
        ? "outgoing"
        : "incoming",

    friendshipId:
      friendship._id.toString(),
  };
}

async function loadProfileMap(
  userIds
) {
  const uniqueIds = [
    ...new Set(
      userIds
        .filter(Boolean)
        .map(String)
    ),
  ];

  if (
    uniqueIds.length === 0
  ) {
    return new Map();
  }

  const profiles =
    await Profile.find({
      user: {
        $in: uniqueIds,
      },
    }).lean();

  return new Map(
    profiles.map(
      (profile) => [
        String(
          profile.user
        ),
        profile,
      ]
    )
  );
}

async function formatPosts(
  posts,
  currentUserId
) {
  const objects =
    posts.map((post) =>
      typeof post.toObject ===
      "function"
        ? post.toObject()
        : post
    );

  const userIds = [];

  for (
    const post of objects
  ) {
    if (
      post.author?._id
    ) {
      userIds.push(
        post.author._id
      );
    }

    for (
      const comment of
      post.comments || []
    ) {
      if (
        comment.author?._id
      ) {
        userIds.push(
          comment.author._id
        );
      }
    }
  }

  const profileMap =
    await loadProfileMap(
      userIds
    );

  return objects.map(
    (post) => ({
      ...post,

      id:
        post._id.toString(),

      author:
        safeUser(
          post.author,
          profileMap.get(
            String(
              post.author?._id
            )
          )
        ),

      likesCount:
        post.likes?.length ||
        0,

      likedByMe:
        Array.isArray(
          post.likes
        ) &&
        post.likes.some(
          (userId) =>
            String(userId) ===
            String(
              currentUserId
            )
        ),

      comments:
        (
          post.comments ||
          []
        ).map(
          (comment) => ({
            ...comment,

            id:
              comment._id?.toString(),

            author:
              safeUser(
                comment.author,
                profileMap.get(
                  String(
                    comment.author
                      ?._id
                  )
                )
              ),
          })
        ),
    })
  );
}

/*
|--------------------------------------------------------------------------
| GET /api/social/me
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  async (
    req,
    res,
    next
  ) => {
    try {
      const profile =
        await getOrCreateProfile(
          req.user._id
        );

      const [
        postsCount,
        friendsCount,
        recentPosts,
      ] =
        await Promise.all([
          SocialPost.countDocuments({
            author:
              req.user._id,
          }),

          getFriendCount(
            req.user._id
          ),

          SocialPost.find({
            author:
              req.user._id,
          })
            .sort({
              createdAt: -1,
            })
            .limit(6)
            .populate(
              "author",
              "fullName role"
            )
            .populate(
              "comments.author",
              "fullName role"
            ),
        ]);

      const posts =
        await formatPosts(
          recentPosts,
          req.user._id
        );

      return res
        .status(200)
        .json({
          success: true,

          profile: {
            id:
              profile._id.toString(),

            user:
              safeUser(
                req.user,
                profile
              ),

            email:
              req.user.email,

            bio:
              profile.bio,

            location:
              profile.location,

            avatar:
              profile.avatar,

            coverImage:
              profile.coverImage,

            travelStyle:
              profile.travelStyle,

            favoriteDestination:
              profile.favoriteDestination,

            visitedCountries:
              profile.visitedCountries,

            interests:
              profile.interests,

            stats: {
              posts:
                postsCount,

              friends:
                friendsCount,

              countries:
                profile
                  .visitedCountries
                  .length,
            },

            recentPosts:
              posts,
          },
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| PATCH /api/social/me
|--------------------------------------------------------------------------
*/

router.patch(
  "/me",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  async (
    req,
    res,
    next
  ) => {
    try {
      const profile =
        await getOrCreateProfile(
          req.user._id
        );

      const allowedStyles = [
        "Adventure",
        "Relaxation",
        "Culture",
        "Food",
        "Nature",
        "Business",
        "Mixed",
      ];

      if (
        req.body.bio !==
        undefined
      ) {
        profile.bio =
          String(
            req.body.bio ||
              ""
          ).trim();
      }

      if (
        req.body.location !==
        undefined
      ) {
        profile.location =
          String(
            req.body.location ||
              ""
          ).trim();
      }

      if (
        req.body.favoriteDestination !==
        undefined
      ) {
        profile.favoriteDestination =
          String(
            req.body
              .favoriteDestination ||
              ""
          ).trim();
      }

      if (
        req.body.travelStyle !==
        undefined
      ) {
        const travelStyle =
          String(
            req.body
              .travelStyle ||
              ""
          ).trim();

        if (
          !allowedStyles.includes(
            travelStyle
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid travel style.",
            });
        }

        profile.travelStyle =
          travelStyle;
      }

      if (
        req.body.visitedCountries !==
        undefined
      ) {
        profile.visitedCountries =
          splitList(
            req.body
              .visitedCountries
          ).slice(
            0,
            50
          );
      }

      if (
        req.body.interests !==
        undefined
      ) {
        profile.interests =
          splitList(
            req.body.interests
          ).slice(
            0,
            20
          );
      }

      const avatar =
        req.files?.avatar?.[0];

      const coverImage =
        req.files
          ?.coverImage?.[0];

      if (avatar) {
        profile.avatar =
          mediaPath(
            avatar
          );
      }

      if (coverImage) {
        profile.coverImage =
          mediaPath(
            coverImage
          );
      }

      await profile.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Profile updated successfully.",
          profile,
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/social/people
|--------------------------------------------------------------------------
*/

router.get(
  "/people",
  async (
    req,
    res,
    next
  ) => {
    try {
      const search =
        String(
          req.query.search ||
            ""
        ).trim();

      const query = {
        _id: {
          $ne:
            req.user._id,
        },
      };

      if (search) {
        query.fullName = {
          $regex:
            escapeRegex(
              search
            ),
          $options: "i",
        };
      }

      const users =
        await User.find(
          query
        )
          .select(
            "fullName role"
          )
          .sort({
            createdAt: -1,
          })
          .limit(24)
          .lean();

      const profileMap =
        await loadProfileMap(
          users.map(
            (user) =>
              user._id
          )
        );

      const people =
        await Promise.all(
          users.map(
            async (user) => ({
              ...safeUser(
                user,
                profileMap.get(
                  String(
                    user._id
                  )
                )
              ),

              relationship:
                await getRelationship(
                  req.user._id,
                  user._id
                ),
            })
          )
        );

      return res
        .status(200)
        .json({
          success: true,
          people,
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/social/users/:userId
|--------------------------------------------------------------------------
*/

router.get(
  "/users/:userId",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params.userId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid user ID.",
          });
      }

      const user =
        await User.findById(
          req.params.userId
        )
          .select(
            "fullName role"
          )
          .lean();

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Traveler not found.",
          });
      }

      const profile =
        await getOrCreateProfile(
          user._id
        );

      const [
        friendsCount,
        postsCount,
        posts,
        relationship,
      ] =
        await Promise.all([
          getFriendCount(
            user._id
          ),

          SocialPost.countDocuments({
            author:
              user._id,
          }),

          SocialPost.find({
            author:
              user._id,
          })
            .sort({
              createdAt: -1,
            })
            .limit(30)
            .populate(
              "author",
              "fullName role"
            )
            .populate(
              "comments.author",
              "fullName role"
            ),

          getRelationship(
            req.user._id,
            user._id
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          profile: {
            user:
              safeUser(
                user,
                profile
              ),

            bio:
              profile.bio,

            location:
              profile.location,

            avatar:
              profile.avatar,

            coverImage:
              profile.coverImage,

            travelStyle:
              profile.travelStyle,

            favoriteDestination:
              profile.favoriteDestination,

            visitedCountries:
              profile.visitedCountries,

            interests:
              profile.interests,

            relationship,

            stats: {
              posts:
                postsCount,

              friends:
                friendsCount,

              countries:
                profile
                  .visitedCountries
                  .length,
            },

            posts:
              await formatPosts(
                posts,
                req.user._id
              ),
          },
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Friend requests
|--------------------------------------------------------------------------
*/

router.post(
  "/friends/:userId",
  async (
    req,
    res,
    next
  ) => {
    try {
      const recipientId =
        req.params.userId;

      if (
        !validId(
          recipientId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid user ID.",
          });
      }

      if (
        String(
          recipientId
        ) ===
        String(
          req.user._id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "You cannot add yourself.",
          });
      }

      const recipient =
        await User.findById(
          recipientId
        );

      if (!recipient) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Traveler not found.",
          });
      }

      const pairKey =
        makePairKey(
          req.user._id,
          recipientId
        );

      const existing =
        await Friendship.findOne({
          pairKey,
        });

      if (existing) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              existing.status ===
              "accepted"
                ? "You are already friends."
                : "A friend request already exists.",
          });
      }

      const friendship =
        await Friendship.create({
          pairKey,

          requester:
            req.user._id,

          recipient:
            recipientId,

          status:
            "pending",
        });

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Friend request sent.",
          friendship,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/friend-requests",
  async (
    req,
    res,
    next
  ) => {
    try {
      const requests =
        await Friendship.find({
          recipient:
            req.user._id,

          status:
            "pending",
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "requester",
            "fullName role"
          )
          .lean();

      const profileMap =
        await loadProfileMap(
          requests.map(
            (request) =>
              request.requester
                ?._id
          )
        );

      return res
        .status(200)
        .json({
          success: true,

          requests:
            requests.map(
              (request) => ({
                id:
                  request._id.toString(),

                createdAt:
                  request.createdAt,

                user:
                  safeUser(
                    request.requester,
                    profileMap.get(
                      String(
                        request
                          .requester
                          ?._id
                      )
                    )
                  ),
              })
            ),
        });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/friends/:friendshipId/accept",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params
            .friendshipId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid friend request ID.",
          });
      }

      const friendship =
        await Friendship.findOne({
          _id:
            req.params
              .friendshipId,

          recipient:
            req.user._id,

          status:
            "pending",
        });

      if (!friendship) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Friend request not found.",
          });
      }

      friendship.status =
        "accepted";

      await friendship.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Friend request accepted.",
          friendship,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/friends/:friendshipId",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params
            .friendshipId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid friendship ID.",
          });
      }

      const friendship =
        await Friendship.findOne({
          _id:
            req.params
              .friendshipId,

          $or: [
            {
              requester:
                req.user._id,
            },
            {
              recipient:
                req.user._id,
            },
          ],
        });

      if (!friendship) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Friendship not found.",
          });
      }

      await friendship.deleteOne();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Friendship removed.",
        });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/friends",
  async (
    req,
    res,
    next
  ) => {
    try {
      const friendships =
        await Friendship.find({
          status:
            "accepted",

          $or: [
            {
              requester:
                req.user._id,
            },
            {
              recipient:
                req.user._id,
            },
          ],
        })
          .sort({
            updatedAt: -1,
          })
          .populate(
            "requester",
            "fullName role"
          )
          .populate(
            "recipient",
            "fullName role"
          )
          .lean();

      const otherUsers =
        friendships.map(
          (friendship) =>
            String(
              friendship
                .requester._id
            ) ===
            String(
              req.user._id
            )
              ? friendship.recipient
              : friendship.requester
        );

      const profileMap =
        await loadProfileMap(
          otherUsers.map(
            (user) =>
              user._id
          )
        );

      return res
        .status(200)
        .json({
          success: true,

          friends:
            friendships.map(
              (
                friendship,
                index
              ) => ({
                friendshipId:
                  friendship
                    ._id
                    .toString(),

                user:
                  safeUser(
                    otherUsers[
                      index
                    ],

                    profileMap.get(
                      String(
                        otherUsers[
                          index
                        ]._id
                      )
                    )
                  ),
              })
            ),
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Posts
|--------------------------------------------------------------------------
*/

router.get(
  "/posts/feed",
  async (
    req,
    res,
    next
  ) => {
    try {
      const posts =
        await SocialPost.find(
          {}
        )
          .sort({
            createdAt: -1,
          })
          .limit(50)
          .populate(
            "author",
            "fullName role"
          )
          .populate(
            "comments.author",
            "fullName role"
          );

      return res
        .status(200)
        .json({
          success: true,

          posts:
            await formatPosts(
              posts,
              req.user._id
            ),
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts",
  upload.single(
    "image"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      const content =
        String(
          req.body.content ||
            ""
        ).trim();

      const destination =
        String(
          req.body.destination ||
            ""
        ).trim();

      const tripTitle =
        String(
          req.body.tripTitle ||
            ""
        ).trim();

      const image =
        mediaPath(
          req.file
        );

      if (
        !content &&
        !image
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Write something or upload an image.",
          });
      }

      const post =
        await SocialPost.create({
          author:
            req.user._id,

          content,
          image,
          destination,
          tripTitle,
        });

      const populatedPost =
        await SocialPost.findById(
          post._id
        )
          .populate(
            "author",
            "fullName role"
          )
          .populate(
            "comments.author",
            "fullName role"
          );

      const [
        formattedPost,
      ] =
        await formatPosts(
          [
            populatedPost,
          ],
          req.user._id
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Post published successfully.",
          post:
            formattedPost,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:postId/like",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params.postId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const post =
        await SocialPost.findById(
          req.params.postId
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      const liked =
        post.likes.some(
          (userId) =>
            String(userId) ===
            String(
              req.user._id
            )
        );

      if (liked) {
        post.likes =
          post.likes.filter(
            (userId) =>
              String(userId) !==
              String(
                req.user._id
              )
          );
      } else {
        post.likes.push(
          req.user._id
        );
      }

      await post.save();

      return res
        .status(200)
        .json({
          success: true,

          liked:
            !liked,

          likesCount:
            post.likes.length,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:postId/comments",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params.postId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const text =
        String(
          req.body.text ||
            ""
        ).trim();

      if (!text) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Comment text is required.",
          });
      }

      if (
        text.length >
        500
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Comment cannot exceed 500 characters.",
          });
      }

      const post =
        await SocialPost.findById(
          req.params.postId
        );

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found.",
          });
      }

      post.comments.push({
        author:
          req.user._id,
        text,
      });

      await post.save();

      const updatedPost =
        await SocialPost.findById(
          post._id
        )
          .populate(
            "author",
            "fullName role"
          )
          .populate(
            "comments.author",
            "fullName role"
          );

      const [
        formattedPost,
      ] =
        await formatPosts(
          [
            updatedPost,
          ],
          req.user._id
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Comment added.",
          post:
            formattedPost,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/posts/:postId",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params.postId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid post ID.",
          });
      }

      const post =
        await SocialPost.findOne({
          _id:
            req.params.postId,

          author:
            req.user._id,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Post not found or you cannot delete it.",
          });
      }

      await post.deleteOne();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Post deleted.",
        });
    } catch (error) {
      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Stories
|--------------------------------------------------------------------------
*/

router.get(
  "/stories",
  async (
    req,
    res,
    next
  ) => {
    try {
      const stories =
        await Story.find({
          expiresAt: {
            $gt:
              new Date(),
          },
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "author",
            "fullName role"
          )
          .lean();

      const profileMap =
        await loadProfileMap(
          stories.map(
            (story) =>
              story.author
                ?._id
          )
        );

      return res
        .status(200)
        .json({
          success: true,

          stories:
            stories.map(
              (story) => ({
                ...story,

                id:
                  story._id.toString(),

                author:
                  safeUser(
                    story.author,
                    profileMap.get(
                      String(
                        story
                          .author
                          ?._id
                      )
                    )
                  ),
              })
            ),
        });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/stories",
  upload.single(
    "image"
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Upload an image for your story.",
          });
      }

      const caption =
        String(
          req.body.caption ||
            ""
        ).trim();

      const destination =
        String(
          req.body.destination ||
            ""
        ).trim();

      const story =
        await Story.create({
          author:
            req.user._id,

          image:
            mediaPath(
              req.file
            ),

          caption,
          destination,
        });

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Story published for 24 hours.",
          story,
        });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/stories/:storyId",
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(
          req.params.storyId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid story ID.",
          });
      }

      const story =
        await Story.findOne({
          _id:
            req.params.storyId,

          author:
            req.user._id,
        });

      if (!story) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Story not found.",
          });
      }

      await story.deleteOne();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Story deleted.",
        });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;