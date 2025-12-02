const { CometChat } = require('@cometchat/chat-sdk-javascript');

console.log('CometChat object keys:');
console.log(Object.keys(CometChat));

console.log('\nGroupType keys:');
console.log(Object.keys(CometChat.GroupType || {}));

console.log('\nRECEIVER_TYPE keys:');
console.log(Object.keys(CometChat.RECEIVER_TYPE || {}));

console.log('\nMESSAGE_TYPE keys:');
console.log(Object.keys(CometChat.MESSAGE_TYPE || {}));