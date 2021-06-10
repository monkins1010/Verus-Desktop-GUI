import React from 'react';
import DefineCurrencyForm from "./defineCurrency/defineCurrencyForm";
import { CONFIRM_DATA, API_SUCCESS, SEND_RESULT, API_CREATE_ADVANCED_CURRENCY } from '../../../util/constants/componentConstants';
import Button from '@material-ui/core/Button';
import SimpleLoader from '../../../containers/SimpleLoader/SimpleLoader'


export const CreateAdvancedCurrencyRender = function() {
  const { advanceFormStep, state, back, props } = this
  const { loading, continueDisabled, formStep, txData } = state
  const { closeModal } = props

  return (
    <div style={{ width: "100%",paddingTop: 35, paddingLeft: 35, paddingRight: 35 }}>
      {loading
        ? CreateAdvancedCurrencyLoading.call(this)
        : CreateAdvancedCurrencyFormRender.call(this)}
      {!loading && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between"
          }}
        >
          <Button
            variant="contained"
            onClick={back}
            size="large"
            color="default"
            style={{
              visibility:
                formStep === CONFIRM_DATA ||
                (formStep === SEND_RESULT && txData.status !== API_SUCCESS)
                  ? "unset"
                  : "hidden"
            }}
          >
            {"Back"}
          </Button>
          <Button
            variant="contained"
            onClick={ formStep === SEND_RESULT ? closeModal : advanceFormStep }
            disabled={continueDisabled}
            size="large"
            color="primary"
          >
            {formStep === SEND_RESULT ? "Done" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}

export const CreateAdvancedCurrencyFormRender = function() {
  const { state, props, getFormData, getContinueDisabled, advanceFormStep } = this;
  const { modalProps, closeModal } = props;

  if (modalProps.modalType === API_CREATE_ADVANCED_CURRENCY) {
    return (
      <DefineCurrencyForm
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
        advanceFormStep_trigger={advanceFormStep}
        closeModal_trigger={closeModal}
      />
    );
  } 
};

export const CreateAdvancedCurrencyLoading = function() {
  return (
    <div 
      className="d-sm-flex flex-column justify-content-sm-center"
      style={{ paddingBottom: 40, height: "100%" }}>
      <div
        className="d-flex d-sm-flex justify-content-center justify-content-sm-center"
        style={{ paddingBottom: 40 }}
      >
        <SimpleLoader size={75} text={"Please wait while Define Currency transaction is confirmed..."}/>
      </div>
    </div>
  )
}


