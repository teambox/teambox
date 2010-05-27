Feature: Uploading a file
  Background:
    Given a project exists with name: "Ruby Rockstars"
      And a confirmed user exists with login: "mislav", first_name: "Mislav", last_name: "Marohnić"
      And I am logged in as "mislav"
      And I am in the project called "Ruby Rockstars"
      When I go to the uploads page of the "Ruby Rockstars" project
       And I follow "Upload a File"

   Scenario: Mislav uploads a valid file with success
       When I attach the file at "features/support/sample_files/dragon.jpg" to "upload_asset"
        And I press "Upload file"
       Then I should see "dragon.jpg" within ".upload"

   Scenario: Mislav tries to upload a file with no asset and fails
       When I press "Upload file"
        And I should see "You can't upload a blank file" within ".form_error"

   Scenario: Mislav tries to upload a file thats too big (that's what she said)
       When I attach a "2" MB file called "rockets.jpg" to "upload_asset"
        And I press "Upload file"
        And I should see "File size can't exceed 1 MB" within ".form_error"
        And I should not see "rockets.jpg" within ".content"
