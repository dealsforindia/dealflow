import React, { useState } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, IndianRupee } from 'lucide-react';

const MortgageCalculatorModal = () => {
    const { isMortgageModalOpen, closeMortgageModal } = useUIStore();

    // Default values
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);

    // Calculation logic
    const calculateEMI = () => {
        const principal = loanAmount;
        const ratePerMonth = interestRate / 12 / 100;
        const months = tenure * 12;

        if (interestRate === 0) return principal / months;

        const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) /
            (Math.pow(1 + ratePerMonth, months) - 1);

        return Math.round(emi);
    };

    const monthlyEMI = calculateEMI();
    const totalAmount = monthlyEMI * tenure * 12;
    const totalInterest = totalAmount - loanAmount;

    if (!isMortgageModalOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => closeMortgageModal()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-card border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => closeMortgageModal()} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X />
                    </button>

                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-accent/20 rounded-full text-accent">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-white">Mortgage Estimator</h2>
                                <p className="text-gray-400 text-sm">Plan your finance with ease</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Loan Amount</span>
                                    <span className="text-accent font-bold">₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
                                </label>
                                <input
                                    type="range"
                                    min="1000000"
                                    max="50000000"
                                    step="100000"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Interest Rate</span>
                                    <span className="text-accent font-bold">{interestRate}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="15"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Loan Tenure</span>
                                    <span className="text-accent font-bold">{tenure} Years</span>
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    step="1"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>

                            <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                                <div className="text-center mb-4">
                                    <p className="text-gray-400 text-sm mb-1">Estimated Monthly EMI</p>
                                    <h3 className="text-4xl font-bold text-white flex items-center justify-center gap-1">
                                        <IndianRupee className="w-6 h-6" />
                                        {monthlyEMI.toLocaleString()}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Total Interest</p>
                                        <p className="text-sm font-semibold text-gray-300">₹{(totalInterest / 100000).toFixed(1)} L</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Total Payable</p>
                                        <p className="text-sm font-semibold text-gray-300">₹{(totalAmount / 100000).toFixed(1)} L</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default MortgageCalculatorModal;
