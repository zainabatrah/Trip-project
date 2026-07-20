const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const SocialPost = require("../models/SocialPost");
const SocialStory = require("../models/SocialStory");
const Friendship = require("../models/Friendship");
const upload = require("../middleware/upload");
const {
  requireAuth,
} = require("../middleware/auth");
const {
  createNotification,
} = require("../services/notificationService");

const router = express.Router();

const USER_PUBLIC_FIELDS =
  "fullName email profileImage bio country role";

function validId(value) {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}

function normalizeText(value) {
  return String(value || "").trim();
}

function buildPairKey(
  firstId,
  secondId
) {
  return [
    String(firstId),
    String(secondId),
  ]
    .sort()
    .join(":");
}

function sameUser(
  firstId,
  secondId
) {
  return (
    String(firstId || "") ===
    String(secondId || "")
  );
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(
      user._id || user.id || ""
    ),
    _id: String(
      user._id || user.id || ""
    ),
    fullName:
      user.fullName || "",
    name:
      user.fullName || "",
    email: user.email || "",
    profileImage:
      user.profileImage || "",
    bio: user.bio || "",
    country: user.country || "",
    role: user.role || "client",
    createdAt:
      user.createdAt || null,
    updatedAt:
      user.updatedAt || null,
  };
}

function buildUploadPath(file) {
  return file
    ? `/uploads/${file.filename}`
    : "";
}

function serializePost(
  post,
  currentUserId
) {
  const likes = Array.isArray(
    post?.likes
  )
    ? post.likes.map((item) =>
        String(item)
      )
    : [];

  return {
    id: String(
      post?._id || post?.id || ""
    ),
    _id: String(
      post?._id || post?.id || ""
    ),
    content:
      post?.content || "",
    image:
      post?.image || "",
    likeCount:
      likes.length,
    likedByCurrentUser:
      likes.includes(
        String(currentUserId)
      ),
    createdAt:
      post?.createdAt || null,
    updatedAt:
      post?.updatedAt || null,
    author: publicUser(
      post?.author
    ),
  };
}

function serializeStory(story) {
  return {
    id: String(
      story?._id || story?.id || ""
    ),
    _id: String(
      story?._id || story?.id || ""
    ),
    content:
      story?.content || "",
    image:
      story?.image || "",
    createdAt:
      story?.createdAt || null,
    expiresAt:
      story?.expiresAt || null,
    author: publicUser(
      story?.author
    ),
  };
}

function extractOtherUser(
  friendship,
  currentUserId
) {
  if (
    sameUser(
      friendship?.requester?._id ||
        friendship?.requester,
      currentUserId
    )
  ) {
    return friendship.recipient;
  }

  return friendship.requester;
}

function serializeFriendship(
  friendship,
  currentUserId
) {
  return {
    id: String(
      friendship?._id ||
        friendship?.id ||
        ""
    ),
    _id: String(
      friendship?._id ||
        friendship?.id ||
        ""
    ),
    status:
      friendship?.status ||
      "pending",
    createdAt:
      friendship?.createdAt || null,
    updatedAt:
      friendship?.updatedAt || null,
    respondedAt:
      friendship?.respondedAt || null,
    requesterId: String(
      friendship?.requester?._id ||
        friendship?.requester ||
        ""
    ),
    recipientId: String(
      friendship?.recipient?._id ||
        friendship?.recipient ||
        ""
    ),
    user: publicUser(
      extractOtherUser(
        friendship,
        currentUserId
      )
    ),
  };
}

async function getAcceptedFriendIds(
  userId
) {
  const friendships =
    await Friendship.find({
      status: "accepted",
      $or: [
        {
          requester: userId,
        },
        {
          recipient: userId,
        },
      ],
    })
      .select(
        "requester recipient"
      )
      .lean();

  return friendships.map(
    (friendship) =>
      String(
        friendship.requester
      ) === String(userId)
        ? friendship.recipient
        : friendship.requester
  );
}

async function populatePost(
  postId
) {
  return SocialPost.findById(postId)
    .populate(
      "author",
      USER_PUBLIC_FIELDS
    )
    .lean();
}

async function populateStory(
  storyId
) {
  return SocialStory.findById(storyId)
    .populate(
      "author",
      USER_PUBLIC_FIELDS
    )
    .lean();
}

router.get(
  "/profile",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const friendIds =
        await getAcceptedFriendIds(
          req.user._id
        );

      const [
        postCount,
        storyCount,
        pendingCount,
        recentPosts,
        activeStories,
        friendsPreview,
      ] = await Promise.all([
        SocialPost.countDocuments({
          author: req.user._id,
        }),
        SocialStory.countDocuments({
          author: req.user._id,
          expiresAt: {
            $gt: new Date(),
          },
        }),
        Friendship.countDocuments({
          recipient: req.user._id,
          status: "pending",
        }),
        SocialPost.find({
          author: req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(4)
          .populate(
            "author",
            USER_PUBLIC_FIELDS
          )
          .lean(),
        SocialStory.find({
          author: req.user._id,
          expiresAt: {
            $gt: new Date(),
          },
        })
          .sort({
            createdAt: -1,
          })
          .limit(6)
          .populate(
            "author",
            USER_PUBLIC_FIELDS
          )
          .lean(),
        User.find({
          _id: {
            $in: friendIds,
          },
        })
          .select(
            USER_PUBLIC_FIELDS
          )
          .sort({
            fullName: 1,
          })
          .limit(6)
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        profile: publicUser(
          req.user
        ),
        statistics: {
          posts: postCount,
          activeStories:
            storyCount,
          friends:
            friendIds.length,
          pendingRequests:
            pendingCount,
        },
        recentPosts:
          recentPosts.map((post) =>
            serializePost(
              post,
              req.user._id
            )
          ),
        activeStories:
          activeStories.map(
            serializeStory
          ),
        friendsPreview:
          friendsPreview.map(
            publicUser
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/feed",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const friendIds =
        await getAcceptedFriendIds(
          req.user._id
        );

      const audienceIds = [
        req.user._id,
        ...friendIds,
      ];

      const [
        posts,
        stories,
      ] = await Promise.all([
        SocialPost.find({
          author: {
            $in: audienceIds,
          },
        })
          .sort({
            createdAt: -1,
          })
          .limit(40)
          .populate(
            "author",
            USER_PUBLIC_FIELDS
          )
          .lean(),
        SocialStory.find({
          author: {
            $in: audienceIds,
          },
          expiresAt: {
            $gt: new Date(),
          },
        })
          .sort({
            createdAt: -1,
          })
          .limit(24)
          .populate(
            "author",
            USER_PUBLIC_FIELDS
          )
          .lean(),
      ]);

      return res.status(200).json({
        success: true,
        currentUser:
          publicUser(req.user),
        statistics: {
          friends:
            friendIds.length,
          postsInFeed:
            posts.length,
          activeStories:
            stories.length,
        },
        stories:
          stories.map(
            serializeStory
          ),
        posts: posts.map((post) =>
          serializePost(
            post,
            req.user._id
          )
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/friends",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const search =
        normalizeText(
          req.query.search
        );

      const searchFilter = search
        ? {
            $or: [
              {
                fullName: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                email: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                country: {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          }
        : {};

      const [
        friendships,
        directoryUsers,
      ] = await Promise.all([
        Friendship.find({
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
            USER_PUBLIC_FIELDS
          )
          .populate(
            "recipient",
            USER_PUBLIC_FIELDS
          )
          .lean(),
        User.find({
          _id: {
            $ne: req.user._id,
          },
          ...searchFilter,
        })
          .select(
            USER_PUBLIC_FIELDS
          )
          .sort({
            fullName: 1,
          })
          .limit(30)
          .lean(),
      ]);

      const friends = [];
      const incomingRequests = [];
      const outgoingRequests = [];
      const relationshipMap =
        new Map();

      for (const friendship of friendships) {
        const serialized =
          serializeFriendship(
            friendship,
            req.user._id
          );

        const userId = String(
          serialized.user?._id || ""
        );

        if (userId) {
          relationshipMap.set(
            userId,
            serialized
          );
        }

        if (
          friendship.status ===
          "accepted"
        ) {
          friends.push(
            serialized
          );
          continue;
        }

        if (
          friendship.status ===
          "pending"
        ) {
          if (
            sameUser(
              friendship.recipient?._id,
              req.user._id
            )
          ) {
            incomingRequests.push(
              serialized
            );
          } else {
            outgoingRequests.push(
              serialized
            );
          }
        }
      }

      const directory =
        directoryUsers.map((user) => {
          const relation =
            relationshipMap.get(
              String(user._id)
            );

          let relationshipStatus =
            "none";

          if (relation) {
            if (
              relation.status ===
              "accepted"
            ) {
              relationshipStatus =
                "friends";
            } else if (
              sameUser(
                relation.recipientId,
                req.user._id
              )
            ) {
              relationshipStatus =
                "incoming";
            } else {
              relationshipStatus =
                "outgoing";
            }
          }

          return {
            user: publicUser(user),
            relationshipStatus,
            friendshipId:
              relation?._id || "",
          };
        });

      return res.status(200).json({
        success: true,
        summary: {
          friends:
            friends.length,
          incomingRequests:
            incomingRequests.length,
          outgoingRequests:
            outgoingRequests.length,
        },
        friends,
        incomingRequests,
        outgoingRequests,
        directory,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/friendships/requests",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const recipientId =
        normalizeText(
          req.body.recipientId
        );

      if (!validId(recipientId)) {
        return res.status(400).json({
          success: false,
          message:
            "A valid recipient is required.",
        });
      }

      if (
        sameUser(
          recipientId,
          req.user._id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot send a friend request to yourself.",
        });
      }

      const recipient =
        await User.findById(
          recipientId
        ).select(
          USER_PUBLIC_FIELDS
        );

      if (!recipient) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      const pairKey =
        buildPairKey(
          req.user._id,
          recipientId
        );

      const existing =
        await Friendship.findOne({
          pairKey,
        });

      if (
        existing?.status ===
        "accepted"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "You are already friends with this user.",
        });
      }

      if (
        existing?.status ===
        "pending"
      ) {
        if (
          sameUser(
            existing.requester,
            req.user._id
          )
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Friend request already sent.",
          });
        }

        return res.status(409).json({
          success: false,
          message:
            "This user has already sent you a request. Accept it from your requests list.",
        });
      }

      const friendship =
        existing ||
        new Friendship({
          pairKey,
        });

      friendship.requester =
        req.user._id;
      friendship.recipient =
        recipientId;
      friendship.status =
        "pending";
      friendship.respondedAt =
        null;

      await friendship.save();

      await createNotification({
        userId: recipientId,
        type: "friend-request",
        title: "New friend request",
        message: `${req.user.fullName || "A traveler"} sent you a friend request.`,
        link: "/profile/friends",
        metadata: {
          friendshipId: String(
            friendship._id
          ),
          requesterId: String(
            req.user._id
          ),
        },
      });

      const populated =
        await Friendship.findById(
          friendship._id
        )
          .populate(
            "requester",
            USER_PUBLIC_FIELDS
          )
          .populate(
            "recipient",
            USER_PUBLIC_FIELDS
          )
          .lean();

      return res.status(201).json({
        success: true,
        message:
          "Friend request sent.",
        friendship:
          serializeFriendship(
            populated,
            req.user._id
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/friendships/:id",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid friendship ID.",
        });
      }

      const action =
        normalizeText(
          req.body.action
        ).toLowerCase();

      if (
        ![
          "accept",
          "reject",
        ].includes(action)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Action must be accept or reject.",
        });
      }

      const friendship =
        await Friendship.findById(
          req.params.id
        );

      if (!friendship) {
        return res.status(404).json({
          success: false,
          message:
            "Friend request not found.",
        });
      }

      if (
        !sameUser(
          friendship.recipient,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only the recipient can respond to this friend request.",
        });
      }

      if (
        friendship.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This request is no longer pending.",
        });
      }

      friendship.status =
        action === "accept"
          ? "accepted"
          : "rejected";
      friendship.respondedAt =
        new Date();

      await friendship.save();

      await createNotification({
        userId: String(
          friendship.requester
        ),
        type:
          action === "accept"
            ? "friend-request-accepted"
            : "friend-request-rejected",
        title:
          action === "accept"
            ? "Friend request accepted"
            : "Friend request rejected",
        message:
          action === "accept"
            ? `${req.user.fullName || "A traveler"} accepted your friend request.`
            : `${req.user.fullName || "A traveler"} rejected your friend request.`,
        link: "/profile/friends",
        metadata: {
          friendshipId: String(
            friendship._id
          ),
          recipientId: String(
            req.user._id
          ),
        },
      });

      const populated =
        await Friendship.findById(
          friendship._id
        )
          .populate(
            "requester",
            USER_PUBLIC_FIELDS
          )
          .populate(
            "recipient",
            USER_PUBLIC_FIELDS
          )
          .lean();

      return res.status(200).json({
        success: true,
        message:
          action === "accept"
            ? "Friend request accepted."
            : "Friend request rejected.",
        friendship:
          serializeFriendship(
            populated,
            req.user._id
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/friendships/:id",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid friendship ID.",
        });
      }

      const friendship =
        await Friendship.findById(
          req.params.id
        );

      if (!friendship) {
        return res.status(404).json({
          success: false,
          message:
            "Friendship not found.",
        });
      }

      const involved =
        sameUser(
          friendship.requester,
          req.user._id
        ) ||
        sameUser(
          friendship.recipient,
          req.user._id
        );

      if (!involved) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot change this friendship.",
        });
      }

      const message =
        friendship.status ===
        "accepted"
          ? "Friend removed."
          : "Friend request cancelled.";

      await Friendship.findByIdAndDelete(
        friendship._id
      );

      return res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts",
  requireAuth,
  upload.single("image"),
  async (
    req,
    res,
    next
  ) => {
    try {
      const content =
        normalizeText(
          req.body.content
        );
      const image =
        buildUploadPath(req.file);

      if (!content && !image) {
        return res.status(400).json({
          success: false,
          message:
            "Add text or an image to create a post.",
        });
      }

      const post =
        await SocialPost.create({
          author: req.user._id,
          content,
          image,
        });

      const populated =
        await populatePost(
          post._id
        );

      return res.status(201).json({
        success: true,
        message:
          "Post published.",
        post: serializePost(
          populated,
          req.user._id
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/posts/:id",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid post ID.",
        });
      }

      const post =
        await SocialPost.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found.",
        });
      }

      if (
        !sameUser(
          post.author,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only delete your own posts.",
        });
      }

      await SocialPost.findByIdAndDelete(
        post._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Post deleted.",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:id/likes",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid post ID.",
        });
      }

      const post =
        await SocialPost.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found.",
        });
      }

      const currentUserId =
        String(req.user._id);

      const alreadyLiked =
        post.likes.some(
          (likeUserId) =>
            String(likeUserId) ===
            currentUserId
        );

      if (alreadyLiked) {
        post.likes =
          post.likes.filter(
            (likeUserId) =>
              String(likeUserId) !==
              currentUserId
          );
      } else {
        post.likes.push(
          req.user._id
        );
      }

      await post.save();

      const populated =
        await populatePost(
          post._id
        );

      return res.status(200).json({
        success: true,
        message:
          alreadyLiked
            ? "Post unliked."
            : "Post liked.",
        post: serializePost(
          populated,
          req.user._id
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/stories",
  requireAuth,
  upload.single("image"),
  async (
    req,
    res,
    next
  ) => {
    try {
      const content =
        normalizeText(
          req.body.content
        );
      const image =
        buildUploadPath(req.file);

      if (!content && !image) {
        return res.status(400).json({
          success: false,
          message:
            "Add text or an image to create a story.",
        });
      }

      const story =
        await SocialStory.create({
          author: req.user._id,
          content,
          image,
        });

      const populated =
        await populateStory(
          story._id
        );

      return res.status(201).json({
        success: true,
        message:
          "Story shared.",
        story:
          serializeStory(
            populated
          ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/stories/:id",
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        !validId(req.params.id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid story ID.",
        });
      }

      const story =
        await SocialStory.findById(
          req.params.id
        );

      if (!story) {
        return res.status(404).json({
          success: false,
          message:
            "Story not found.",
        });
      }

      if (
        !sameUser(
          story.author,
          req.user._id
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only delete your own stories.",
        });
      }

      await SocialStory.findByIdAndDelete(
        story._id
      );

      return res.status(200).json({
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
