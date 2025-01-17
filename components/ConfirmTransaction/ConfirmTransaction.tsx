import React, { useEffect, useState } from 'react';
import style from './ConfirmTransaction.module.scss';
import Close from 'components/assets/Close';
import { UserWallet } from 'interfaces';
import Metamask from 'components/assets/Providers/Metamask'
import WalletConnect from 'components/assets/Providers/WalletConnect'
import Ethereum from 'components/assets/Networks/Ethereum';
import TresLeches from 'components/assets/Networks/Binance';
import Check from 'components/assets/Check';
import Caps from 'components/assets/Caps';
import { formatCaps, middleEllipsis } from 'utils/strings';
import { Option, options } from 'components/base/Select/NetworkSelect'
import { useAppSelector } from 'redux/hooks';
import { ChainTypes } from 'interfaces';
import { getEstimateFees } from 'helpers/wallet.helper';

export interface ConfirmTransactionProps {
    open: boolean;
    setOpen: Function;
    capsToSwap: number | string;
    from: Option | null;
    onConfirm: Function;
    transferPending?: boolean;
}

const NetworkRow = (option: Option | null, userWallet: UserWallet | null) => {
    return (
        <div className={style.networkContainer}>
            <div className={"row " + style.networkRow}>
                <div className={"col-9 col-md-8 d-flex align-items-center"}>
                    <div>{option?.value === ChainTypes.erc20 ? <Ethereum className={"mx-1"} /> : <TresLeches className={"mx-1"} />}</div>
                    <div className={style.networkLabel}>{option?.label}</div>
                </div>
                {userWallet && userWallet.chainType === option?.value &&
                    <div className={"col-3 col-md-4 d-flex align-items-center justify-content-center"}>
                        {userWallet && userWallet.networkType === "walletconnect" ? <WalletConnect className={style.connectedIcon} /> : <Metamask className={style.connectedIcon} />}
                        <span className={style.connectedLabel}>{"Connected"}</span>
                        <Check className={style.connectedCheck} />
                    </div>
                }
            </div>
        </div>
    )
}

const ConfirmTransaction: React.FC<ConfirmTransactionProps> = ({ open, setOpen, capsToSwap, from, onConfirm, transferPending }) => {
    const userWallet = useAppSelector((state) => state.user.userWallet)
    const [isTermAccepted, setIsTermAccepted] = useState(false)
    const [estimateFees, setEstimateFees] = useState(0)
    const to = options.filter(x => x.value !== from?.value)[0]
    const canConfirmTransaction = userWallet && isTermAccepted && capsToSwap > 0 && capsToSwap <= userWallet.capsAmount
    const handleConfirm = () => {
        if (canConfirmTransaction && !transferPending) {
            onConfirm()
        }
    }
    const updateEstimateFees = async () => {
        setEstimateFees(Number(await getEstimateFees(from)))
    }
    useEffect(() => {
        if (!open) {
            setIsTermAccepted(false);
        }
        if (open) updateEstimateFees()
    }, [open])
    return (
        <>
            {open &&
                <div className={style.wrapper}>
                    <div className={style.confirmTransactionAlignBox}>
                        <div className={style.confirmTransactionContainer}>
                            <div className={"container p-2 p-md-3"}>
                                <div className={"row"}>
                                    <div onClick={() => setOpen(false)}><Close className={style.closeButton} /></div>
                                </div>
                                <div className={"row d-flex justify-content-center text-center"}>
                                    <span className={style.title}>Confirmation</span>
                                    <hr className={style.divider} />
                                </div>
                                <div className={"row d-flex text-center"}>
                                    <div className={style.capsToSwapContainer}>
                                        <span className={style.capsToSwap}>{`${formatCaps(capsToSwap)} TRES`}</span>
                                    </div>
                                </div>
                                <div className={"row px-4 pt-md-3 pt-2"}>
                                    <span className={style.networkTitle}>From</span>
                                    {NetworkRow(from, userWallet)}
                                </div>
                                <div className={"row px-4 pt-md-3 pt-2"}>
                                    <span className={style.networkTitle}>To</span>
                                    {NetworkRow(to, userWallet)}
                                </div>
                                <div className={"row py-3 px-4"}>
                                    <div className={"col-6 " + style.leftLabel}>Asset</div>
                                    <div className={"col-6 " + style.rightLabel}>
                                        <Caps className={style.gridIcon} /> {` TRES`}
                                    </div>
                                    <div className={"col-6 " + style.leftLabel}>Destination</div>
                                    <div className={"col-6 " + style.rightLabel}>
                                        <span className={"d-none d-md-block"}>
                                            {userWallet && userWallet.networkType === "walletconnect" ?
                                                <WalletConnect className={style.gridIcon + " " + style.connectedIcon} />
                                                :
                                                <Metamask className={style.gridIcon + " " + style.connectedIcon} />
                                            }
                                            {userWallet && middleEllipsis(userWallet.address)}
                                        </span>
                                        <span className={"d-block d-md-none"}>
                                            {userWallet && userWallet.networkType === "walletconnect" ?
                                                <WalletConnect className={style.gridIcon + " " + style.connectedIcon} />
                                                :
                                                <Metamask className={style.gridIcon + " " + style.connectedIcon} />
                                            }
                                            {userWallet && middleEllipsis(userWallet.address, 6)}
                                        </span>
                                    </div>
                                    <div className={"col-6 " + style.leftLabel}>Network fee</div>
                                    <div className={"col-6 " + style.rightLabel}>
                                        {estimateFees && estimateFees > 0 ? estimateFees.toFixed(4) : 0.001} {(userWallet && userWallet.chainType === ChainTypes.bep20) ? "BNB" : "ETH"}
                                    </div>
                                    <div className={"col-6 " + style.leftLabel}>You will receive</div>
                                    <div className={"col-6 " + style.rightLabel}>
                                        <Caps className={style.gridIcon} /> {` ${formatCaps(capsToSwap)} TRES`}
                                    </div>
                                </div>
                                <div className={"row px-4"}>
                                    <span className={style.feeWarningLabel}>The network fees and execution price depend on the market condition,  you may get a different rate when the transaction is complete</span>
                                </div>
                                <div className={"row pt-3 px-4 d-flex align-items-center"}>
                                    <div className={"col-1 " + style.radioButton + " " + (isTermAccepted ? style.radioButtonChecked : "")} onClick={() => setIsTermAccepted(!isTermAccepted)}></div>
                                    <div className={"col-11 " + style.termsLabel}>I have read and agree to the <a href="#">terms</a></div>
                                </div>
                                <div className={"row py-3 px-4"}>
                                    <div className={"btn btn-outline-primary rounded-pill " + style.buttonLabel + " " + (canConfirmTransaction || transferPending ? "" : "disabled")} onClick={handleConfirm}>
                                        CONFIRM TRANSACTION
                            </div>
                                </div>
                                <div className={"row d-flex justify-content-center"}>
                                    <span className={style.capsAddressLabel}>You will receive your TRES on the same address. Only the network will change.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ConfirmTransaction;
