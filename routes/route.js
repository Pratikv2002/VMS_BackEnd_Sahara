import express from 'express'
import { approveVisit, createNewVisit, countVisits, rejectVisit, pendingCheckoutCount, markCheckoutComplete, approvedVisitsCount, pendingVisitsCount, rejectedVisitsCount, verifyToken, getEmployees, getLocations, getVisitLogs, getSevenDaysVisits, getDigitalPass, getVisits, postEmployees, getVisitorByMobile, postVisitor, verifyPass, getDesignations,
    getAllVisitorTypes,
    getVisitorTypeById,
    addVisitorType,
    updateVisitorType,
    activateVisitorType,
    deactivateVisitorType,
    deleteVisitorType } from '../controllers/controller.js'
import {
    employeeSignUp,
    employeeSignIn,
    gatekeeperSignUp,
    gatekeeperSignIn
} from '../controllers/auth.controller.js'
import validateToken from '../middleware/validateVisitToken.middleware.js'
import gatekeeperAuthMiddleware from '../middleware/gatekeeperAuth.middleware.js'

const router = express.Router();

// Auth routes
router.post('/gatekeeper-signup', gatekeeperSignUp)
router.post('/gatekeeper-signin', gatekeeperSignIn)
router.post('/employee-signup', employeeSignUp)
router.post('/employee-signin', employeeSignIn)

// Gatekeeper routes
router.post('/new-visit', createNewVisit) // done
router.get('/token-verification/:token', validateToken, verifyToken)
router.get('/approve/:token', validateToken, approveVisit)
router.get('/reject/:token', validateToken, rejectVisit)
router.post('/complete-checkout', markCheckoutComplete)

// Dashboard routes
router.get('/visit-count', countVisits)
router.get('/approved-visits-count', approvedVisitsCount)
router.get('/pending-visits-count', pendingVisitsCount)
router.get('/rejected-visits-count', rejectedVisitsCount)
router.get('/pending-checkout-count', pendingCheckoutCount)
router.get('/get-lastseven-day-visit', getSevenDaysVisits)
router.get('/get-visits/:fromDate/:toDate', getVisits)

// miscilionus routes
router.get('/get-employees', getEmployees)
router.get('/get-locations', getLocations)
router.get('/get-visitlog/:id/:token', getVisitLogs)
router.get('/get-digital-pass/:token', validateToken, getDigitalPass)
router.post('/post-employees', postEmployees)
router.post('/post-visitor', postVisitor)
router.get('/get-visitor-by-mobile/:mobile', getVisitorByMobile)
router.get('/verify-pass/:token', verifyPass)
router.get("/get-designations", getDesignations)

router.get('/get-visitor-types', getAllVisitorTypes);
router.get('/get-visitor-type/:id', getVisitorTypeById);
router.post('/add-visitor-type', addVisitorType);
router.put('/update-visitor-type/:id', updateVisitorType);
router.patch('/activate-visitor-type/:id', activateVisitorType);
router.patch('/deactivate-visitor-type/:id', deactivateVisitorType);
router.delete('/delete-visitor-type/:id', deleteVisitorType);
router.get('/', (req, res) => { return res.status(200).json({ msg: "Jay Shree Ram" }) })



export default router
