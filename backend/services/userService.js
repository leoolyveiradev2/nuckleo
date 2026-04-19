// Lógica de usuários/amigos - Placeholder
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createError } = require('../utils/errorUtils');

class UserService {
  async getPublicProfile(username) {
    const user = await User.findOne({ username })
      .select('name username avatar bio website friends createdAt')
      .lean();
    if (!user) throw createError('User not found', 404);
    return { ...user, friendCount: user.friends?.length ?? 0 };
  }

  async updateProfile(userId, data) {
    const allowed = ['name', 'username', 'bio', 'website', 'avatar'];
    const update = {};
    allowed.forEach((k) => { if (data[k] !== undefined) update[k] = data[k]; });

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) throw createError('User not found', 404);
    return user;
  }

  async updatePreferences(userId, preferences) {
    const allowed = ['theme', 'accentColor', 'language', 'emailNotifications'];
    const update = {};
    allowed.forEach((k) => { if (preferences[k] !== undefined) update[`preferences.${k}`] = preferences[k]; });

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('preferences');
    return user;
  }

  async sendFriendRequest(senderId, targetId) {
    if (senderId.toString() === targetId) throw createError('Cannot add yourself', 400);

    const [sender, target] = await Promise.all([
      User.findById(senderId),
      User.findById(targetId),
    ]);
    if (!target) throw createError('User not found', 404);

    if (sender.friends.includes(targetId)) throw createError('Already friends', 409);
    if (sender.sentRequests.includes(targetId)) throw createError('Request already sent', 409);
    if (sender.pendingRequests.includes(targetId)) {
      // Auto-accept if target already sent a request
      return this.acceptFriendRequest(senderId, targetId);
    }

    await Promise.all([
      User.findByIdAndUpdate(senderId, { $addToSet: { sentRequests: targetId } }),
      User.findByIdAndUpdate(targetId, { $addToSet: { pendingRequests: senderId } }),
    ]);

    await Notification.create({
      recipient: targetId,
      sender: senderId,
      type: 'friend_request',
      title: `${sender.name} sent you a friend request`,
      link: `/profile/${sender.username}`,
    });

    return { message: 'Friend request sent' };
  }

  async acceptFriendRequest(userId, requesterId) {
    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId),
    ]);
    if (!requester) throw createError('User not found', 404);

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $addToSet: { friends: requesterId },
        $pull: { pendingRequests: requesterId },
      }),
      User.findByIdAndUpdate(requesterId, {
        $addToSet: { friends: userId },
        $pull: { sentRequests: userId },
      }),
    ]);

    await Notification.create({
      recipient: requesterId,
      sender: userId,
      type: 'friend_accepted',
      title: `${user.name} accepted your friend request`,
      link: `/profile/${user.username}`,
    });

    return { message: 'Friend request accepted' };
  }

  async removeFriend(userId, friendId) {
    await Promise.all([
      User.findByIdAndUpdate(userId, { $pull: { friends: friendId, sentRequests: friendId, pendingRequests: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: userId, sentRequests: userId, pendingRequests: userId } }),
    ]);
    return { message: 'Friend removed' };
  }

  async getFriends(userId) {
    const user = await User.findById(userId)
      .populate('friends', 'name username avatar bio lastSeen')
      .populate('pendingRequests', 'name username avatar')
      .populate('sentRequests', 'name username avatar');
    return {
      friends: user.friends,
      pendingRequests: user.pendingRequests,
      sentRequests: user.sentRequests,
    };
  }

  async searchUsers(query, excludeId) {
    if (!query || query.length < 2) return [];
    const users = await User.find({
      $and: [
        { _id: { $ne: excludeId } },
        { isActive: true },
        { $text: { $search: query } },
      ],
    })
      .select('name username avatar bio')
      .limit(20)
      .lean();
    return users;
  }
}

module.exports = new UserService();
