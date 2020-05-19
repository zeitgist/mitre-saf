// import Vue from 'vue'; // have to import for Vue.set when need to add new properties and reactivity stuff

import _json from "@/assets/data/mitre-saf-control-mapping.json";

const json = Object.freeze(_json);

const state = {
  controlFilters: [],
  profileFilters: [],
  columnFilters: Object.keys(json[0]).filter(col => col !== 'NIST SP 800-53 Control').reduce((acc, cur) => { // rename to something that makes more sense
    return {
      ...acc,
      [cur]: 0, // 0=all, 1=on, 2=off
    };
  }, {}),
  data: json,
};

const getters = {
  getControls: state => {
    return state.data.map(row => row['NIST SP 800-53 Control']);
  },
  getProfiles: state => {
    return Object.keys(state.data[0]).filter(key => !["NIST SP 800-53 Control", "ALL"].includes(key));
  },
  getControlFilters: state => {
    return state.controlFilters;
  },
  getProfileFilters: state => {
    return state.profileFilters;
  },
  getColumnFilters: state => {
    return state.columnFilters;
  },
  getData: state => {
    let data = state.data;

    const controlFilters = getters.getControlFilters(state);
    if(controlFilters.length){
      data = data.filter(row => controlFilters.some(filter => row['NIST SP 800-53 Control'].toLowerCase().includes(filter.toLowerCase())));
    }

    const colFilters = getters.getColumnFilters(state);
    for(let col of Object.keys(colFilters)) {
      data = data.filter(row => colFilters[col] === 0  || (colFilters[col] === 1 && row[col]) || (colFilters[col] === 2 && !row[col]));
    }

    return data;
  },
  getColumns: state => {
    const filters = getters.getProfileFilters(state);
    let columnheaders = Object.keys(state.data[0]);
    if(filters.length){
      columnheaders = columnheaders.filter(col => ['NIST SP 800-53 Control', 'ALL'].includes(col) || filters.some(filter => col.toLowerCase().includes(filter.toLowerCase())));
    }

    const columnWidth = 100;
    let columns = [];
    for(let column of columnheaders) {
      columns.push({
        text: ["☒", "☑", "☐"][getters.getColumnFilters(state)[column] ?? 0] + column,
        value: column,
        align: "center",
        width: columnWidth,
        type: "default",
        field: (rec) => rec[column] ? "InSpec" : "",
      });
    }

    let controlNames = undefined;
    if((controlNames = columns.find(col => col.value === "NIST SP 800-53 Control"))) {
      controlNames.text = controlNames.value;
      controlNames.align = 'start';
      controlNames.field = (rec) => rec[controlNames.value];
    }
    let all = undefined;
    if((all = columns.find(col => col.value === "ALL"))) {
      all.type = 'check';
      all.field = (rec) => rec[all.value];
    }
    let heimdall = undefined;
    if((heimdall = columns.find(col => col.value === "CWE tool data mapped by Heimdall_tools"))) {
      heimdall.field = (rec) => rec[heimdall.value] ? "SonarQ, ZAP, Burp" : "";
    }

    return columns;
  }
};

const mutations = {
  setControlFilters(state, filters) {
    state.controlFilters = filters;
  },
  setProfileFilters(state, filters) {
    state.profileFilters = filters;
  },
  updateColumnFilters(state, column) {
    if(column !== "NIST SP 800-53 Control") {
      state.columnFilters[column] = (state.columnFilters[column]+1)%3;
    }
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
