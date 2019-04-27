export default class API {
  static endpoint =
    'https://us-central1-tw-account-deletion-challenge.cloudfunctions.net'
  static fetchWorkspaces = `${API.endpoint}/fetchWorkspaces?userId={0}`
  static checkOwnership = `${API.endpoint}/checkOwnership`
  static terminateAccount = `${API.endpoint}/terminateAccount`
  static submitSurvey = `${API.endpoint}/submitSurvey`
}
