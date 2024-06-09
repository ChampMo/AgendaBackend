import { createClient } from '@supabase/supabase-js'
import { v4 as uuid } from "uuid";
export const supabase = createClient('https://fpvhqgksrqktucubhvte.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdmhxZ2tzcnFrdHVjdWJodnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2NTI5ODMsImV4cCI6MjAzMzIyODk4M30.g4LSUEsLnc9qOrZ873_t7WvSyr07ai4j0c7B-7uiFOA')






export async function upLoadPROFILE(buffer, userId, fileName) {
    const { data: existingFiles, error: existingError } = await supabase.storage
        .from('profile')
        .list(`user/${userId}`);

    if (existingError) {
        throw existingError;
    }

    if (existingFiles && existingFiles.length > 0) {
        const { error: removeError } = await supabase.storage
            .from('profile')
            .remove(`user/${userId}/${existingFiles[0].name}`);

        if (removeError) {
            throw removeError;
        }
    }
    const uniqueFileName = `profile_user_${uuid()}`;

    const { data, error } = await supabase.storage
        .from('profile')
        .upload(`user/${userId}/${uniqueFileName}`, buffer);

    if (error) {
        throw error;
    }

    const { data: publicData } = await supabase.storage
        .from('profile')
        .getPublicUrl(`user/${userId}/${uniqueFileName}`);

    if (!publicData) {
        throw new Error('Unable to retrieve public URL');
    }

    return publicData.publicUrl;

}

export async function upLoadWORKSPACEIMG(buffer, workspaceId, fileName) {
    const { data: existingFiles, error: existingError } = await supabase.storage
        .from('profile')
        .list(`workspace/${workspaceId}`);

    if (existingError) {
        throw existingError;
    }

    if (existingFiles && existingFiles.length > 0) {
        const { error: removeError } = await supabase.storage
            .from('profile')
            .remove(`workspace/${workspaceId}/${existingFiles[0].name}`);

        if (removeError) {
            throw removeError;
        }
    }
    const uniqueFileName = `profile_workspace${uuid()}`;
    const { data, error } = await supabase.storage
        .from('profile')
        .upload(`workspace/${workspaceId}/${uniqueFileName}`, buffer);

    if (error) {
        throw error;
    }

    const { data:datapublicURL } = await supabase.storage
        .from("profile")
        .getPublicUrl(`workspace/${workspaceId}/${uniqueFileName}`);

    return datapublicURL.publicUrl;

}