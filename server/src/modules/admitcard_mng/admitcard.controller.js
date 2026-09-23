const admitcardService = require("./admitcard.service");

const getAdmitCards = async (req, res, next) => {

    try {
        const { department, semester } = req.query;

        const filters = {
            ...(department && { department }),
            ...(semester && { semester })
        };

        const result = await admitcardService.getAdmitCards(filters);

        res.status(200).json({
            success: true,
            message: "Admit card statuses fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const generateAdmitCards = async (req, res, next) => {

    try {
        const { department, semester } = req.body;

        const filters = {
            ...(department && { department }),
            ...(semester && { semester })
        };

        const result = await admitcardService.generateAdmitCards(filters, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: `${result.generated} admit card(s) generated`,
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const downloadAdmitCard = async (req, res, next) => {

    try {
        const pdfBuffer = await admitcardService.downloadAdmitCard(req.params.studentId);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="admit-card-${req.params.studentId}.pdf"`
        });
        res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};


const getMyAdmitCard = async (req, res, next) => {

    try {
        const result = await admitcardService.getMyAdmitCard(req.user.id);

        res.status(200).json({
            success: true,
            message: "Admit card status fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const downloadMyAdmitCard = async (req, res, next) => {

    try {
        const pdfBuffer = await admitcardService.downloadMyAdmitCard(req.user.id);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="admit-card.pdf"`
        });
        res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAdmitCards,
    generateAdmitCards,
    downloadAdmitCard,
    getMyAdmitCard,
    downloadMyAdmitCard
};
