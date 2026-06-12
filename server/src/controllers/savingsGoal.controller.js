import savingsGoalService from '../service/savings/savingsGoal.service.js';

const addSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    try {
        const goal = await savingsGoalService.addSavingsGoal(req.body, req.user.userId, txId);
        return res.status(201).json({
            success: true,
            message: 'Savings goal created successfully',
            data: goal,
        });
    } catch (error) {
        next(error);
    }
};

const getSavingsGoals = async (req, res, next) => {
    const txId = req.id;
    try {
        const result = await savingsGoalService.getSavingsGoals(
            req.validatedQuery ?? req.query,
            req.user.userId,
            txId
        );
        return res.status(200).json({
            success: true,
            message: 'Savings goals fetched successfully',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

const updateSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.updateSavingsGoal(id, req.body, req.user.userId, txId);
        return res.status(200).json({
            success: true,
            message: 'Savings goal updated successfully',
            data: goal,
        });
    } catch (error) {
        next(error);
    }
};

const contributeToGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.contributeToGoal(
            id,
            req.body.amount,
            req.user.userId,
            txId
        );
        return res.status(200).json({
            success: true,
            message: 'Savings updated successfully',
            data: goal,
        });
    } catch (error) {
        next(error);
    }
};

const deleteSavingsGoal = async (req, res, next) => {
    const txId = req.id;
    const { id } = req.params;
    try {
        const goal = await savingsGoalService.deleteSavingsGoal(id, req.user.userId, txId);
        return res.status(200).json({
            success: true,
            message: 'Savings goal deleted successfully',
            data: goal,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    addSavingsGoal,
    getSavingsGoals,
    updateSavingsGoal,
    contributeToGoal,
    deleteSavingsGoal,
};
