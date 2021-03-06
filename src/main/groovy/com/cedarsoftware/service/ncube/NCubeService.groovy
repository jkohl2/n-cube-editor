package com.cedarsoftware.service.ncube

import com.cedarsoftware.ncube.ApplicationID
import com.cedarsoftware.ncube.Axis
import com.cedarsoftware.ncube.AxisType
import com.cedarsoftware.ncube.AxisValueType
import com.cedarsoftware.ncube.NCube
import com.cedarsoftware.ncube.NCubeInfoDto
import com.cedarsoftware.ncube.NCubeManager
import com.cedarsoftware.ncube.ReferenceAxisLoader
import com.cedarsoftware.util.StringUtilities
import com.cedarsoftware.util.io.JsonObject
import com.cedarsoftware.util.io.JsonReader
import com.cedarsoftware.util.io.JsonWriter
import groovy.transform.CompileStatic
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
/**
 * RESTful Ajax/JSON API for editor application
 *
 * @author John DeRegnaucourt (jdereg@gmail.com)
 *         <br/>
 *         Copyright (c) Cedar Software LLC
 *         <br/><br/>
 *         Licensed under the Apache License, Version 2.0 (the "License")
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *         <br/><br/>
 *         http://www.apache.org/licenses/LICENSE-2.0
 *         <br/><br/>
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */
@CompileStatic
class NCubeService
{
    private static final Logger LOG = LogManager.getLogger(NCubeService.class)

    List<NCubeInfoDto> search(ApplicationID appId, String cubeNamePattern, String contentMatching, Map options)
    {
        if (!cubeNamePattern.startsWith('*'))
        {
            cubeNamePattern = '*' + cubeNamePattern
        }
        if (!cubeNamePattern.endsWith('*'))
        {
            cubeNamePattern = cubeNamePattern + '*'
        }

        return NCubeManager.search(appId, cubeNamePattern, contentMatching, options)
    }

    void restoreCubes(ApplicationID appId, Object[] cubeNames, String username)
    {
        NCubeManager.restoreCubes(appId, cubeNames, username)
    }

    List<NCubeInfoDto> getRevisionHistory(ApplicationID appId, String cubeName)
    {
        return NCubeManager.getRevisionHistory(appId, cubeName)
    }

    List<String> getAppNames(String tenant)
    {
        return NCubeManager.getAppNames(tenant)
    }

    Map<String, List<String>> getVersions(String tenant, String app)
    {
        return NCubeManager.getVersions(tenant, app)
    }

    void createBranch(ApplicationID appId)
    {
        NCubeManager.createBranch(appId)
    }

    Set<String> getBranches(ApplicationID appId)
    {
        return NCubeManager.getBranches(appId)
    }

    Set<String> getBranches(String tenant)
    {
        return NCubeManager.getBranches(tenant)
    }

    List<NCubeInfoDto> getBranchChanges(ApplicationID appId)
    {
        return NCubeManager.getBranchChangesFromDatabase(appId)
    }

    List<NCubeInfoDto> commitBranch(ApplicationID appId, Object[] infoDtos, String username)
    {
        return NCubeManager.commitBranch(appId, infoDtos, username)
    }

    int rollbackCubes(ApplicationID appId, Object[] cubeNames, String username)
    {
        NCubeManager.rollbackCubes(appId, cubeNames, username)
    }

    Map<String, Object> updateBranch(ApplicationID appId, String username)
    {
        return NCubeManager.updateBranch(appId, username)
    }

    Map<String, Object> updateBranchCube(ApplicationID appId, String cubeName, String sourceBranch, String username)
    {
        return NCubeManager.updateBranchCube(appId, cubeName, sourceBranch, username)
    }

    void deleteBranch(ApplicationID appId)
    {
        NCubeManager.deleteBranch(appId);
    }

    void acceptTheirs(ApplicationID appId, String cubeName, String branchSha1, String username)
    {
        NCubeManager.mergeAcceptTheirs(appId, cubeName, branchSha1, username)
    }

    void acceptMine(ApplicationID appId, String cubeName, String username)
    {
        NCubeManager.mergeAcceptMine(appId, cubeName, username)
    }

    void createCube(ApplicationID appId, NCube ncube, String username)
    {
        List<NCubeInfoDto> list = NCubeManager.search(appId, ncube.name, null, [(NCubeManager.SEARCH_ACTIVE_RECORDS_ONLY):true])
        if (!list.isEmpty())
        {
            throw new IllegalArgumentException(ncube.name + ' exists.')
        }
        list = NCubeManager.search(appId, ncube.name, null, [(NCubeManager.SEARCH_DELETED_RECORDS_ONLY):true])
        if (!list.isEmpty())
        {
            throw new IllegalArgumentException(ncube.name + ' was previously deleted. Use restore instead.')
        }
        NCubeManager.updateCube(appId, ncube, username)
    }

    boolean deleteCubes(ApplicationID appId, Object[] cubeNames, String username)
    {
        return NCubeManager.deleteCubes(appId, cubeNames, username)
    }

    void duplicateCube(ApplicationID appId, ApplicationID destAppId, String cubeName, String newName, String username)
    {
        NCubeManager.duplicate(appId, destAppId, cubeName, newName, username)
    }

    void releaseCubes(ApplicationID appId, String newSnapVer)
    {
        NCubeManager.releaseCubes(appId, newSnapVer)
    }

    void changeVersionValue(ApplicationID appId, String newSnapVer)
    {
        NCubeManager.changeVersionValue(appId, newSnapVer)
    }

    void addAxis(ApplicationID appId, String cubeName, String axisName, String type, String valueType, String username)
    {
        if (StringUtilities.isEmpty(axisName))
        {
            throw new IllegalArgumentException("Axis name cannot be empty.")
        }

        NCube ncube = NCubeManager.getCube(appId, cubeName)
        if (ncube == null)
        {
            throw new IllegalArgumentException("Could not add axis '" + axisName + "', NCube '" + cubeName + "' not found for app: " + appId)
        }

        long maxId = -1
        Iterator<Axis> i = ncube.getAxes().iterator()
        while (i.hasNext())
        {
            Axis axis = i.next()
            if (axis.id > maxId)
            {
                maxId = axis.id
            }
        }
        Axis axis = new Axis(axisName, AxisType.valueOf(type), AxisValueType.valueOf(valueType), false, Axis.DISPLAY, maxId + 1)
        ncube.addAxis(axis)
        NCubeManager.updateCube(appId, ncube, username)
    }

    void addAxis(ApplicationID appId, String cubeName, String axisName, ApplicationID refAppId, String refCubeName, String refAxisName, ApplicationID transformAppId, String transformCubeName, String transformMethodName, String username)
    {
        NCube nCube = NCubeManager.getCube(appId, cubeName)
        if (nCube == null)
        {
            throw new IllegalArgumentException("Could not add axis '" + axisName + "', NCube '" + cubeName + "' not found for app: " + appId)
        }

        long maxId = -1
        Iterator<Axis> i = nCube.getAxes().iterator()
        while (i.hasNext())
        {
            Axis axis = i.next()
            if (axis.id > maxId)
            {
                maxId = axis.id
            }
        }

        Map args = [:]
        args[ReferenceAxisLoader.REF_TENANT] = refAppId.tenant
        args[ReferenceAxisLoader.REF_APP] = refAppId.app
        args[ReferenceAxisLoader.REF_VERSION] = refAppId.version
        args[ReferenceAxisLoader.REF_STATUS] = refAppId.status
        args[ReferenceAxisLoader.REF_BRANCH] = refAppId.branch
        args[ReferenceAxisLoader.REF_CUBE_NAME] = refCubeName  // cube name of the holder of the referring (pointing) axis
        args[ReferenceAxisLoader.REF_AXIS_NAME] = refAxisName    // axis name of the referring axis (the variable that you had missing earlier)
        args[ReferenceAxisLoader.TRANSFORM_APP] = transformAppId?.app	// Notice no target tenant.  User MUST stay within TENENT boundary
        args[ReferenceAxisLoader.TRANSFORM_VERSION] = transformAppId?.version
        args[ReferenceAxisLoader.TRANSFORM_STATUS] = transformAppId?.status
        args[ReferenceAxisLoader.TRANSFORM_BRANCH] = transformAppId?.branch
        args[ReferenceAxisLoader.TRANSFORM_CUBE_NAME] = transformCubeName
        args[ReferenceAxisLoader.TRANSFORM_METHOD_NAME] = transformMethodName
        ReferenceAxisLoader refAxisLoader = new ReferenceAxisLoader(cubeName, axisName, args)

        Axis axis = new Axis(axisName, maxId + 1, false, refAxisLoader)
        nCube.addAxis(axis)
        NCubeManager.updateCube(appId, nCube, username)
    }

    /**
     * Delete the specified axis.
     */
    void deleteAxis(ApplicationID appId, String name, String axisName, String username)
    {
        NCube ncube = NCubeManager.getCube(appId, name)
        if (ncube == null)
        {
            throw new IllegalArgumentException("Could not delete axis '" + axisName + "', NCube '" + name + "' not found for app: " + appId)
        }

        if (ncube.getNumDimensions() == 1)
        {
            throw new IllegalArgumentException("Could not delete axis '" + axisName + "' - at least one axis must exist on n-cube.")
        }

        ncube.deleteAxis(axisName)
        NCubeManager.updateCube(appId, ncube, username)
    }

    /**
     * Update the 'informational' part of the Axis (not the columns).
     */
    void updateAxis(ApplicationID appId, String name, String origAxisName, String axisName, boolean hasDefault, boolean isSorted, boolean fireAll, String username)
    {
        NCube ncube = NCubeManager.getCube(appId, name)
        if (ncube == null)
        {
            throw new IllegalArgumentException("Could not update axis '" + origAxisName + "', NCube '" + name + "' not found for app: " + appId)
        }

        // Rename axis
        if (!origAxisName.equalsIgnoreCase(axisName))
        {
            ncube.renameAxis(origAxisName, axisName)
        }

        // Update default column setting (if changed)
        Axis axis = ncube.getAxis(axisName)
        if (axis.hasDefaultColumn() && !hasDefault)
        {   // If it went from having default column to NOT having default column...
            ncube.deleteColumn(axisName, null)
        }
        else if (!axis.hasDefaultColumn() && hasDefault)
        {
            if (axis.type != AxisType.NEAREST)
            {
                ncube.addColumn(axisName, null)
            }
        }

        // update preferred column order
        if (axis.type == AxisType.RULE)
        {
            axis.setFireAll(fireAll)
        }
        else
        {
            axis.setColumnOrder(isSorted ? Axis.SORTED : Axis.DISPLAY)
        }

        ncube.clearSha1();
        NCubeManager.updateCube(appId, ncube, username)
    }

    /**
     * Removes the reference from one axis to another.
     */
    void breakAxisReference(ApplicationID appId, String name, String axisName, String username)
    {
        NCube ncube = NCubeManager.getCube(appId, name)
        if (ncube == null)
        {
            throw new IllegalArgumentException("Could not break reference for '" + axisName + "', NCube '" + name + "' not found for app: " + appId)
        }

        // Update default column setting (if changed)
        ncube.breakAxisReference(axisName);
        NCubeManager.updateCube(appId, ncube, username)
    }

    /**
     * Update the indicated column (by ID) with the passed in String value.  The String value
     * is parsed into DISCRETE, RANGE, SET, NEAREST, or RULE, and to the proper axis value type
     * for the axis.  This allows Strings like "[10, 25]" to be passed into a Range axis, for
     * example, and it will be added as a Range(10, 25) and will go through all the proper
     * "up promotion" before being set into the column.
     */
    void updateColumnCell(ApplicationID appId, String cubeName, String colId, String value, String username)
    {
        NCube ncube = NCubeManager.getCube(appId, cubeName)
        if (ncube == null)
        {
            throw new IllegalArgumentException("Could not update Column, cube: " + cubeName + " not found for app: " + appId)
        }

        long id
        try
        {
            id = Long.parseLong(colId)
        }
        catch (NumberFormatException e)
        {
            throw new IllegalArgumentException("Column ID passed in (" + colId + ") is not a number, attempting to update column on NCube '" + cubeName + "'")
        }

        Axis axis = ncube.getAxisFromColumnId(id)
        if (axis == null)
        {
            throw new IllegalArgumentException("Column ID passed in (" + colId + ") does not match any axis on NCube '" + cubeName + "'")
        }

        ncube.updateColumn(id, axis.convertStringToColumnValue(value))
        NCubeManager.updateCube(appId, ncube, username)
    }

    /**
     * In-place update of a cell.  'Value' is the final (converted) object type to be stored
     * in the indicated (by colIds) cell.
     */
    void updateNCube(NCube ncube, String username)
    {
        ApplicationID appId = ncube.getApplicationID()
        NCubeManager.updateCube(appId, ncube, username)
    }

    boolean renameCube(ApplicationID appId, String oldName, String newName, String username)
    {
        return NCubeManager.renameCube(appId, oldName, newName, username)
    }

    /**
     * Update / Save a single n-cube -or- create / update a batch of n-cubes, represented as a JSON
     * array [] of n-cubes.
     */
    void updateCube(ApplicationID appId, String name, String json, String username)
    {
        json = json.trim()
        List cubes
        boolean checkName
        if (json.startsWith("["))
        {
            checkName = false
            cubes = getCubes(json)
        }
        else
        {
            checkName = true
            cubes = new ArrayList()
            cubes.add(NCube.fromSimpleJson(json))
        }

        for (Object object : cubes)
        {
            NCube ncube = (NCube) object
            if (checkName)
            {
                if (!StringUtilities.equalsIgnoreCase(name, ncube.name))
                {
                    throw new IllegalArgumentException("The n-cube name cannot be different than selected n-cube.  Use Rename n-cube option from n-cube menu to rename the cube.")
                }
            }

            NCubeManager.updateCube(appId, ncube, username)
        }
    }

    /**
     * In-place update of a cell.  'Value' is the final (converted) object type to be stored
     * in the indicated (by colIds) cell.
     */
    String getTestData(ApplicationID appId, String cubeName)
    {
        return NCubeManager.getTestData(appId, cubeName)
    }

    /**
     * In-place update of a cell.  'Value' is the final (converted) object type to be stored
     * in the indicated (by colIds) cell.
     */
    boolean updateTestData(ApplicationID appId, String cubeName, String tests)
    {
        return NCubeManager.updateTestData(appId, cubeName, tests)
    }

    NCube getCube(ApplicationID appId, String name)
    {
        NCube cube = NCubeManager.getCube(appId, name)
        if (cube == null)
        {
            throw new IllegalArgumentException("Unable to load cube: " + name + " for app: " + appId)
        }
        return cube
    }

    NCube loadCube(ApplicationID appId, String name)
    {
        NCube cube = NCubeManager.loadCube(appId, name)
        if (cube == null)
        {
            throw new IllegalArgumentException("Unable to load cube: " + name + " for app: " + appId)
        }
        return cube
    }

    NCube loadCubeById(long id)
    {
        NCube cube = NCubeManager.loadCubeById(id)
        if (cube == null)
        {
            throw new IllegalArgumentException('Unable to load cube by id: ' + id)
        }
        return cube
    }

    void getReferencedCubeNames(ApplicationID appId, String cubeName, Set<String> references)
    {
        NCubeManager.getReferencedCubeNames(appId, cubeName, references)
    }

    String resolveRelativeUrl(ApplicationID appId, String relativeUrl)
    {
        return NCubeManager.resolveRelativeUrl(appId, relativeUrl)
    }

    void clearCache(ApplicationID appId)
    {
        NCubeManager.clearCache(appId)
    }

    // =========================================== Helper methods ======================================================

    static List getCubes(String json)
    {
        String lastSuccessful = ""
        try
        {
            JsonObject ncubes = (JsonObject) JsonReader.jsonToMaps(json)
            Object[] cubes = ncubes.getArray()
            List cubeList = new ArrayList(cubes.length)

            for (Object cube : cubes)
            {
                JsonObject ncube = (JsonObject) cube
                if (ncube.containsKey("action"))
                {
                    cubeList.add(ncube)
                    lastSuccessful = (String) ncube.get("ncube")
                }
                else
                {
                    String json1 = JsonWriter.objectToJson(ncube)
                    NCube nCube = NCube.fromSimpleJson(json1)
                    cubeList.add(nCube)
                    lastSuccessful = nCube.getName()
                }
            }

            return cubeList
        }
        catch (Exception e)
        {
            String s = "Failed to load n-cubes from passed in JSON, last successful cube read: " + lastSuccessful
            throw new IllegalArgumentException(s, e)
        }
    }

    Object getUpToDateStatus(ApplicationID appId, String cubeName)
    {
        return true
//        if (appId.isHead())
//        {   // HEAD cube can never be out-of-date by definition.
//            return true
//        }
//
//        Map options = [(NCubeManager.SEARCH_EXACT_MATCH_NAME): true,
//                       (NCubeManager.SEARCH_ACTIVE_RECORDS_ONLY): true]
//
//        String realHeadSha1
//        List<NCubeInfoDto> list = NCubeManager.search(appId.asHead(), cubeName, null, options)
//        if (list.size() != 1)
//        {   // New cube in your branch but not yet in HEAD branch
//            return true
//        }
//
//        NCubeInfoDto dto = list[0]
//        realHeadSha1 = dto.sha1
//
//        list = NCubeManager.search(appId, cubeName, null, options)
//        if (list.size() != 1)
//        {   // Ignore when you can't find the cube that was requested
//            return true
//        }
//        dto = list[0]
//        return StringUtilities.equalsIgnoreCase(realHeadSha1, dto.headSha1)
    }
}
