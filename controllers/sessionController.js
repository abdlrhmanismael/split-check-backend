const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../config/cloudinary');

// Create a new session
const createSession = async (req, res) => {
  try {
    const {
      totalOrderAmount,
      taxPercentage,
      servicePercentage,
      deliveryFee,
      numberOfFriends,
      instaPayURL
    } = req.body;

    // Generate unique session ID
    const sessionId = uuidv4();

    // Upload file to Cloudinary if provided
    let cloudinaryUrl = '';
    if (req.file) {
      cloudinaryUrl = await uploadToCloudinary(req.file.path);
    }

    // Create new session with null/undefined handling
    const session = new Session({
      sessionId,
      totalOrderAmount: parseFloat(totalOrderAmount),
      taxPercentage: taxPercentage ? parseFloat(taxPercentage) : 0,
      servicePercentage: servicePercentage ? parseFloat(servicePercentage) : 0,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0,
      numberOfFriends: numberOfFriends ? parseInt(numberOfFriends) : 1,
      instaPayURL: instaPayURL || '',
      billImage: cloudinaryUrl
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        sessionId: session.sessionId,
        sessionLink: session.sessionLink,
        totalOrderAmount: session.totalOrderAmount,
        taxPercentage: session.taxPercentage,
        servicePercentage: session.servicePercentage,
        deliveryFee: session.deliveryFee,
        numberOfFriends: session.numberOfFriends,
        instaPayURL: session.instaPayURL,
        billImage: session.billImage,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      details: error.message
    });
  }
};

// Get session details
const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ sessionId: id, isActive: true });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({
      session: {
        sessionId: session.sessionId,
        totalOrderAmount: session.totalOrderAmount,
        taxPercentage: session.taxPercentage,
        servicePercentage: session.servicePercentage,
        deliveryFee: session.deliveryFee,
        numberOfFriends: session.numberOfFriends,
        instaPayURL: session.instaPayURL,
        billImage: session.billImage, // Cloudinary URL
        friends: session.friends.map(friend => ({
          id: friend._id,
          name: friend.name,
          products: friend.products,
          paymentMethod: friend.paymentMethod,
          subtotal: friend.subtotal,
          taxAmount: friend.taxAmount,
          serviceAmount: friend.serviceAmount,
          deliveryShare: friend.deliveryShare,
          totalAmount: friend.totalAmount,
          hasPaid: friend.hasPaid,
          joinedAt: friend.joinedAt
        })),
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: 'Failed to get session',
      details: error.message
    });
  }
};

// Add friend to session
const addFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, products, paymentMethod } = req.body;

    const session = await Session.findOne({ sessionId: id, isActive: true });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Check if maximum number of friends reached
    if (session.friends.length >= session.numberOfFriends) {
      return res.status(400).json({
        error: 'Maximum number of friends already joined this session'
      });
    }

    // Check if friend name already exists
    const existingFriend = session.friends.find(friend => 
      friend.name.toLowerCase() === name.toLowerCase()
    );

    if (existingFriend) {
      return res.status(400).json({
        error: 'A friend with this name already exists in the session'
      });
    }

    // Calculate friend's amounts
    const calculations = session.calculateFriendTotal({ products });

    // Create new friend object
    const newFriend = {
      name,
      products,
      paymentMethod,
      subtotal: calculations.subtotal,
      taxAmount: calculations.taxAmount,
      serviceAmount: calculations.serviceAmount,
      deliveryShare: calculations.deliveryShare,
      totalAmount: calculations.totalAmount,
      hasPaid: false
    };

    // Add friend to session
    session.friends.push(newFriend);
    await session.save();

    res.status(201).json({
      message: 'Friend added successfully',
      friend: {
        id: session.friends[session.friends.length - 1]._id,
        name: newFriend.name,
        products: newFriend.products,
        paymentMethod: newFriend.paymentMethod,
        subtotal: newFriend.subtotal,
        taxAmount: newFriend.taxAmount,
        serviceAmount: newFriend.serviceAmount,
        deliveryShare: newFriend.deliveryShare,
        totalAmount: newFriend.totalAmount,
        hasPaid: newFriend.hasPaid
      }
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({
      error: 'Failed to add friend',
      details: error.message
    });
  }
};

// Get session summary
const getSessionSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ sessionId: id, isActive: true });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const summary = session.getSummary();

    res.json({
      summary: {
        sessionId: session.sessionId,
        totalOrderAmount: summary.totalOrderAmount,
        totalPaidInstaPay: summary.totalPaidInstaPay,
        totalPaidCash: summary.totalPaidCash,
        totalUnpaid: summary.totalUnpaid,
        friendsCount: summary.friendsCount,
        expectedFriendsCount: summary.expectedFriendsCount,
        billImage: session.billImage, // Add bill image to summary
        friends: session.friends.map(friend => ({
          id: friend._id,
          name: friend.name,
          products: friend.products,
          subtotal: friend.subtotal,
          taxAmount: friend.taxAmount,
          serviceAmount: friend.serviceAmount,
          deliveryShare: friend.deliveryShare,
          totalAmount: friend.totalAmount,
          paymentMethod: friend.paymentMethod ? 'InstaPay' : 'Cash',
          hasPaid: friend.hasPaid,
          joinedAt: friend.joinedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting session summary:', error);
    res.status(500).json({
      error: 'Failed to get session summary',
      details: error.message
    });
  }
};

// Update friend's payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const { hasPaid } = req.body;

    const session = await Session.findOne({ sessionId: id, isActive: true });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Find friend by ID
    const friend = session.friends.id(friendId);

    if (!friend) {
      return res.status(404).json({
        error: 'Friend not found in this session'
      });
    }

    // Update payment status
    friend.hasPaid = hasPaid;
    await session.save();

    res.json({
      message: 'Payment status updated successfully',
      friend: {
        id: friend._id,
        name: friend.name,
        totalAmount: friend.totalAmount,
        paymentMethod: friend.paymentMethod ? 'InstaPay' : 'Cash',
        hasPaid: friend.hasPaid
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      error: 'Failed to update payment status',
      details: error.message
    });
  }
};

// Delete session (admin only)
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ sessionId: id });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Soft delete by setting isActive to false
    session.isActive = false;
    await session.save();

    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session',
      details: error.message
    });
  }
};

module.exports = {
  createSession,
  getSession,
  addFriend,
  getSessionSummary,
  updatePaymentStatus,
  deleteSession
};
