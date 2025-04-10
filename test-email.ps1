try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test-email" -Method GET -ErrorAction Stop
    Write-Output "Success! Response:"
    $response | ConvertTo-Json -Depth 4
}
catch {
    Write-Output "Error making request:"
    Write-Output "Status code: $($_.Exception.Response.StatusCode.value__)"
    
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorResponse = $reader.ReadToEnd()
        Write-Output "Error response: $errorResponse"
    }
    catch {
        Write-Output "Could not read error response: $_"
    }
} 