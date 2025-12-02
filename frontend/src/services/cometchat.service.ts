import { CometChat } from "@cometchat/chat-sdk-javascript";

// CometChat configuration
const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
const REGION = import.meta.env.VITE_COMETCHAT_REGION;
const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

let isCometChatInitialized = false;

/**
 * Initialize CometChat SDK
 * This should be called once when the app starts
 */
export const initializeCometChat = async (): Promise<void> => {
  if (isCometChatInitialized) {
    return;
  }

  try {
    const appSettings = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(REGION)
      .build();

    await CometChat.init(APP_ID, appSettings);
    isCometChatInitialized = true;
    console.log("CometChat initialized successfully");
  } catch (error) {
    console.error("Error initializing CometChat:", error);
    throw error;
  }
};

/**
 * Login user to CometChat
 * @param uid - User ID
 * @param authToken - Authentication token (optional, if not provided, will use UID)
 */
export const loginToCometChat = async (uid: string, authToken?: string): Promise<CometChat.User> => {
  try {
    // If authToken is not provided, use UID as authToken
    const token = authToken || uid;
    const user = await CometChat.login(uid, token);
    console.log("CometChat login successful:", user);
    return user;
  } catch (error) {
    console.error("Error logging into CometChat:", error);
    throw error;
  }
};

/**
 * Create a new user in CometChat
 * @param uid - User ID
 * @param name - User name
 */
export const createCometChatUser = async (uid: string, name: string): Promise<CometChat.User> => {
  try {
    const user = new CometChat.User(uid);
    user.setName(name);
    
    const createdUser = await CometChat.createUser(user, AUTH_KEY);
    console.log("CometChat user created:", createdUser);
    return createdUser;
  } catch (error) {
    console.error("Error creating CometChat user:", error);
    throw error;
  }
};

/**
 * Get current logged in user
 */
export const getLoggedInUser = async (): Promise<CometChat.User | null> => {
  try {
    const user = await CometChat.getLoggedinUser();
    return user;
  } catch (error) {
    console.error("Error getting logged in user:", error);
    return null;
  }
};

/**
 * Logout from CometChat
 */
export const logoutFromCometChat = async (): Promise<void> => {
  try {
    await CometChat.logout();
    console.log("CometChat logout successful");
  } catch (error) {
    console.error("Error logging out from CometChat:", error);
    throw error;
  }
};

/**
 * Send a text message
 * @param receiverID - Receiver's user ID or group ID
 * @param messageText - Text message to send
 * @param receiverType - Type of receiver (user or group)
 */
export const sendTextMessage = async (
  receiverID: string,
  messageText: string,
  receiverType: "user" | "group" = "user"
): Promise<CometChat.BaseMessage> => {
  try {
    const messageType = CometChat.MESSAGE_TYPE.TEXT;
    const receiverTypeValue = receiverType === "user" 
      ? CometChat.RECEIVER_TYPE.USER 
      : CometChat.RECEIVER_TYPE.GROUP;

    const textMessage = new CometChat.TextMessage(
      receiverID,
      messageText,
      messageType
    );
    
    if (receiverType === "user") {
      textMessage.setReceiverType(CometChat.RECEIVER_TYPE.USER);
    } else {
      textMessage.setReceiverType(CometChat.RECEIVER_TYPE.GROUP);
    }

    const message = await CometChat.sendMessage(textMessage);
    console.log("Message sent successfully:", message);
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get list of users
 * @param limit - Number of users to fetch (default: 30)
 */
export const getUsersList = async (limit: number = 30): Promise<CometChat.User[]> => {
  try {
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .build();

    const users = await usersRequest.fetchNext();
    return users;
  } catch (error) {
    console.error("Error fetching users list:", error);
    throw error;
  }
};

/**
 * Get list of groups
 * @param limit - Number of groups to fetch (default: 30)
 */
export const getGroupsList = async (limit: number = 30): Promise<CometChat.Group[]> => {
  try {
    const groupsRequest = new CometChat.GroupsRequestBuilder()
      .setLimit(limit)
      .build();

    const groups = await groupsRequest.fetchNext();
    return groups;
  } catch (error) {
    console.error("Error fetching groups list:", error);
    throw error;
  }
};

/**
 * Create a new group
 * @param guid - Group ID
 * @param name - Group name
 * @param groupType - Type of group (public, private, password)
 * @param password - Password for password-protected groups (optional)
 */
export const createGroup = async (
  guid: string,
  name: string,
  groupType: "public" | "private" | "password" = "public",
  password?: string
): Promise<CometChat.Group> => {
  try {
    // Using string literals for group types as CometChat.GroupType may not be available
    let groupTypeValue: string;
    
    switch (groupType) {
      case "public":
        groupTypeValue = "public";
        break;
      case "private":
        groupTypeValue = "private";
        break;
      case "password":
        groupTypeValue = "password";
        break;
      default:
        groupTypeValue = "public";
    }

    // @ts-ignore - Ignore TypeScript error for CometChat API
    const group = new CometChat.Group(guid, name, groupTypeValue, password);
    const createdGroup = await CometChat.createGroup(group);
    console.log("Group created successfully:", createdGroup);
    return createdGroup;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

/**
 * Join a group
 * @param guid - Group ID
 * @param groupType - Type of group
 * @param password - Password for password-protected groups (optional)
 */
export const joinGroup = async (
  guid: string,
  groupType: "public" | "private" | "password" = "public",
  password?: string
): Promise<CometChat.Group> => {
  try {
    // Using string literals for group types as CometChat.GroupType may not be available
    let groupTypeValue: string;
    
    switch (groupType) {
      case "public":
        groupTypeValue = "public";
        break;
      case "private":
        groupTypeValue = "private";
        break;
      case "password":
        groupTypeValue = "password";
        break;
      default:
        groupTypeValue = "public";
    }

    // @ts-ignore - Ignore TypeScript error for CometChat API
    const group = await CometChat.joinGroup(guid, groupTypeValue, password);
    console.log("Joined group successfully:", group);
    return group;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

/**
 * Get messages from a user or group
 * @param uid - User ID or Group ID
 * @param limit - Number of messages to fetch (default: 30)
 * @param receiverType - Type of receiver (user or group)
 */
export const getMessages = async (
  uid: string,
  limit: number = 30,
  receiverType: "user" | "group" = "user"
): Promise<CometChat.BaseMessage[]> => {
  try {
    const messagesRequest = receiverType === "user"
      ? new CometChat.MessagesRequestBuilder()
          .setUID(uid)
          .setLimit(limit)
          .build()
      : new CometChat.MessagesRequestBuilder()
          .setGUID(uid)
          .setLimit(limit)
          .build();

    const messages = await messagesRequest.fetchPrevious();
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Attach a message listener for real-time updates
 * @param listenerId - Unique ID for the listener
 * @param onTextMessageReceived - Callback for text messages
 * @param onUserJoined - Callback when user joins
 * @param onUserLeft - Callback when user leaves
 */
export const attachMessageListener = (
  listenerId: string,
  onTextMessageReceived: (message: CometChat.BaseMessage) => void,
  onUserJoined?: (user: CometChat.User) => void,
  onUserLeft?: (user: CometChat.User) => void
): void => {
  try {
    const listener = new CometChat.MessageListener({
      onTextMessageReceived: onTextMessageReceived,
      onUserJoined: onUserJoined,
      onUserLeft: onUserLeft,
    });

    CometChat.addMessageListener(listenerId, listener);
    console.log("Message listener attached successfully");
  } catch (error) {
    console.error("Error attaching message listener:", error);
    throw error;
  }
};

/**
 * Remove a message listener
 * @param listenerId - Unique ID for the listener
 */
export const removeMessageListener = (listenerId: string): void => {
  try {
    CometChat.removeMessageListener(listenerId);
    console.log("Message listener removed successfully");
  } catch (error) {
    console.error("Error removing message listener:", error);
    throw error;
  }
};