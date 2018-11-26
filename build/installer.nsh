!macro customInstall
  DetailPrint "Register captosh URI Handler"
  DeleteRegKey HKCR "captosh"
  WriteRegStr HKCR "captosh" "" "URL:captosh"
  WriteRegStr HKCR "captosh" "URL Protocol" ""
  WriteRegStr HKCR "captosh\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "captosh\shell" "" ""
  WriteRegStr HKCR "captosh\shell\Open" "" ""
  WriteRegStr HKCR "captosh\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend
