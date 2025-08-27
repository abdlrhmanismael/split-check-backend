const express = require('express');
const router = express.Router();

const sessionController = require('../controllers/sessionController');
const upload = require('../middleware/upload');
const {
  createSessionValidation,
  addFriendValidation,
  sessionIdValidation,
  updatePaymentValidation
} = require('../middleware/validation');

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new order splitting session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - totalOrderAmount
 *             properties:
 *               totalOrderAmount:
 *                 type: number
 *                 description: Total order amount
 *                 example: 150.00
 *               taxPercentage:
 *                 type: number
 *                 description: Tax percentage (0-100) - Optional, defaults to 0
 *                 example: 15.0
 *                 default: 0
 *               servicePercentage:
 *                 type: number
 *                 description: Service percentage (0-100) - Optional, defaults to 0
 *                 example: 10.0
 *                 default: 0
 *               deliveryFee:
 *                 type: number
 *                 description: Delivery fee amount - Optional, defaults to 0
 *                 example: 5.00
 *                 default: 0
 *               numberOfFriends:
 *                 type: integer
 *                 description: Number of friends expected to join - Optional, defaults to 1
 *                 example: 3
 *                 default: 1
 *               instaPayURL:
 *                 type: string
 *                 description: InstaPay payment URL - Optional, defaults to empty string
 *                 example: https://instapay.com/pay/123
 *                 default: ""
 *               billImage:
 *                 type: string
 *                 format: binary
 *                 description: Bill image file (JPG, JPEG, PNG only, max 5MB) - Optional
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Create a new session
// POST /api/sessions
router.post('/', 
  upload.single('billImage'),
  createSessionValidation,
  sessionController.createSession
);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: a395af99-ee96-4e2f-896e-4d83eaffa7c1
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get session details
// GET /api/sessions/:id
router.get('/:id',
  sessionIdValidation,
  sessionController.getSession
);

/**
 * @swagger
 * /api/sessions/{id}/friends:
 *   post:
 *     summary: Add a friend to a session
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: a395af99-ee96-4e2f-896e-4d83eaffa7c1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - products
 *               - paymentMethod
 *             properties:
 *               name:
 *                 type: string
 *                 description: Friend's name
 *                 example: John Doe
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Product'
 *                 description: List of products ordered by the friend
 *               paymentMethod:
 *                 type: boolean
 *                 description: Payment method (true for InstaPay, false for cash)
 *                 example: false
 *     responses:
 *       201:
 *         description: Friend added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 friend:
 *                   $ref: '#/components/schemas/Friend'
 *       400:
 *         description: Validation error or maximum friends reached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Add friend to session
// POST /api/sessions/:id/friends
router.post('/:id/friends',
  addFriendValidation,
  sessionController.addFriend
);

/**
 * @swagger
 * /api/sessions/{id}/summary:
 *   get:
 *     summary: Get session summary with payment details and bill image
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: a395af99-ee96-4e2f-896e-4d83eaffa7c1
 *     responses:
 *       200:
 *         description: Session summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   allOf:
 *                     - $ref: '#/components/schemas/SessionSummary'
 *                     - type: object
 *                       properties:
 *                         billImage:
 *                           type: string
 *                           description: URL of the uploaded bill image
 *                           example: https://res.cloudinary.com/example/image/upload/v123/bill.jpg
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get session summary
// GET /api/sessions/:id/summary
router.get('/:id/summary',
  sessionIdValidation,
  sessionController.getSessionSummary
);

/**
 * @swagger
 * /api/sessions/{id}/friends/{friendId}/payment:
 *   patch:
 *     summary: Update friend's payment status
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: a395af99-ee96-4e2f-896e-4d83eaffa7c1
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend ID
 *         example: 68af82d386eee8686d802095
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hasPaid
 *             properties:
 *               hasPaid:
 *                 type: boolean
 *                 description: Whether the friend has paid
 *                 example: true
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 friend:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     paymentMethod:
 *                       type: string
 *                     hasPaid:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session or friend not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Update friend's payment status
// PATCH /api/sessions/:id/friends/:friendId/payment
router.patch('/:id/friends/:friendId/payment',
  updatePaymentValidation,
  sessionController.updatePaymentStatus
);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session (soft delete)
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *         example: a395af99-ee96-4e2f-896e-4d83eaffa7c1
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Delete session (admin only)
// DELETE /api/sessions/:id
router.delete('/:id',
  sessionIdValidation,
  sessionController.deleteSession
);

module.exports = router;
